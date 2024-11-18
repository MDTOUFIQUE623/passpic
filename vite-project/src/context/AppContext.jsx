import { createContext, useState, useEffect } from "react";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import axios from 'axios'
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loadFaceDetectionModel, createPassportPhoto } from '../utils/faceDetection';
import { compressImage, needsCompression } from '../utils/imageCompression';

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [credit, setCredit] = useState(null);
    const { getToken, isSignedIn } = useAuth();
    const { user } = useUser();
    const [image, setImage] = useState(false)
    const [resultImage, setResultImage] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate()
    const { openSignIn } = useClerk()

    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [passportImage, setPassportImage] = useState(null);

    // Load face detection model on mount
    useEffect(() => {
        const loadModel = async () => {
            if (isModelLoaded) return;
            try {
                await loadFaceDetectionModel();
                setIsModelLoaded(true);
                console.log('Face detection model loaded successfully');
            } catch (error) {
                console.error('Error loading face detection model:', error);
                toast.error('Failed to load face detection model. Please refresh the page.');
            }
        };
        loadModel();
    }, []);

    const loadCreditsData = async () => {
        if (!isSignedIn) {
            setCredit(null);
            return;
        }
        
        try {
            console.log('Loading credits data...');
            const token = await getToken();
            if (!token) {
                console.error('No authentication token available');
                throw new Error('Authentication token not available');
            }
            
            const response = await axios.get(`${backendUrl}/api/user/credits`, {
                headers: { 
                    'token': token,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('Credits response:', response.data);

            if (response.data.success) {
                setCredit(response.data.credits);
            } else {
                throw new Error(response.data.message || 'Failed to load credits');
            }
        } catch (error) {
            console.error("Error loading credits:", error);
            
            let errorMessage = 'Failed to load credits';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'Network error - please check your connection';
            }
            
            toast.error(errorMessage);
            setCredit(null);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            let retryCount = 0;
            const maxRetries = 3;
            
            const loadWithRetry = async () => {
                try {
                    await loadCreditsData();
                } catch (error) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Retrying credit load (${retryCount}/${maxRetries})...`);
                        setTimeout(loadWithRetry, 2000 * retryCount); // Exponential backoff
                    }
                }
            };
            
            loadWithRetry();
        } else {
            setCredit(null);
        }
    }, [isSignedIn]);

    const processImage = async (image) => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }

        if (!image) {
            toast.error('No image selected');
            return;
        }

        try {
            setIsProcessing(true);
            setImage(image);
            setResultImage(false);
            navigate('/result');

            setProcessingStep('Preparing image...');

            // Add validation for image type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(image.type.toLowerCase())) {
                throw new Error('Invalid image format. Please use JPG, PNG, or WEBP');
            }

            // Check if image needs compression
            let processedImage = image;
            if (await needsCompression(image)) {
                setProcessingStep('Optimizing image size...');
                try {
                    processedImage = await compressImage(image);
                    console.log('Image compression successful:', {
                        originalSize: `${(image.size / (1024 * 1024)).toFixed(2)}MB`,
                        compressedSize: `${(processedImage.size / (1024 * 1024)).toFixed(2)}MB`,
                        compressionRatio: `${((1 - processedImage.size / image.size) * 100).toFixed(1)}%`
                    });
                } catch (compressionError) {
                    console.error('Image compression failed:', compressionError);
                    // Continue with original image if compression fails
                    processedImage = image;
                }
            }

            const formData = new FormData();
            formData.append('image', processedImage);
            formData.append('clerkId', user.id);

            const token = await getToken();
            if (!token) throw new Error('Authentication token not available');

            setProcessingStep('Removing background...');
            
            console.log('Sending request to server...', {
                imageSize: `${(processedImage.size / (1024 * 1024)).toFixed(2)}MB`,
                imageType: processedImage.type,
                fileName: processedImage.name
            });

            const response = await axios({
                method: 'post',
                url: `${backendUrl}/api/image/remove-bg`,
                data: formData,
                headers: { 
                    'token': token,
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: 31457280, // 30MB
                maxBodyLength: 31457280,
                timeout: 60000, // 60 second timeout
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProcessingStep(`Uploading image... ${progress}%`);
                }
            });

            const { data } = response;

            if (!data.success) {
                throw new Error(data.message || 'Failed to process image');
            }

            setResultImage(data.resultImage);
            if (data.creditBalance !== undefined) {
                setCredit(data.creditBalance);
            }
            toast.success(data.message || 'Background removed successfully!');
            
        } catch (error) {
            console.error('Error processing image:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                type: error.type
            });

            let errorMessage = 'Failed to process image';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Handle specific error cases
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.response?.status === 413) {
                errorMessage = 'Image size too large. Please try a smaller image.';
            } else if (error.response?.status === 429) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            }

            toast.error(errorMessage);
            
            if (errorMessage.includes('credit') && credit === 0) {
                navigate('/buy');
            }

            // Reset states on error
            setResultImage(false);
        } finally {
            setIsProcessing(false);
            setProcessingStep('');
        }
    };

    const handleConvertToPassport = async () => {
        if (!resultImage) {
            toast.error('Please remove background first');
            return;
        }

        if (!isModelLoaded) {
            toast.error('Face detection model is still loading. Please wait.');
            return;
        }

        setIsConverting(true);
        try {
            const passportPhoto = await createPassportPhoto(resultImage);
            setPassportImage(passportPhoto);
            toast.success('Passport photo created successfully');
        } catch (error) {
            console.error('Error creating passport photo:', error);
            toast.error(error.message || 'Failed to create passport photo');
        } finally {
            setIsConverting(false);
        }
    };

    const value = {
        credit,
        setCredit,
        loadCreditsData,
        backendUrl,
        image, 
        setImage,
        processImage,
        resultImage, 
        setResultImage,
        isProcessing,
        processingStep,
        isConverting,
        passportImage,
        handleConvertToPassport,
        isModelLoaded,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;