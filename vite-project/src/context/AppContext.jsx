import { createContext, useState, useEffect } from "react";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import axios from 'axios'
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { loadFaceDetectionModel, createPassportPhoto } from '../utils/faceDetection';

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [credit, setCredit] = useState(null);
    const { getToken, isSignedIn } = useAuth();

    const [image, setImage] = useState(false)
    const [resultImage, setResultImage] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate()
    const { openSignIn } = useClerk()

    // Add model loading state
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [passportImage, setPassportImage] = useState(null);

    // Load face detection model on mount
    useEffect(() => {
        const loadModel = async () => {
            try {
                await loadFaceDetectionModel();
                setIsModelLoaded(true);
                console.log('Face detection model loaded successfully');
            } catch (error) {
                console.error('Error loading face detection model:', error);
                toast.error('Failed to load face detection model');
            }
        };
        loadModel();
    }, []);

    const loadCreditsData = async () => {
        try {
            if (!isSignedIn) return;
            
            const token = await getToken();
            const response = await axios.get(`${backendUrl}/api/user/credits`, {
                headers: { 
                    token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setCredit(response.data.credits);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("Error loading credits:", error);
            toast.error(error.message || "Failed to load credits");
        }
    };

    // Load credits when user signs in
    useEffect(() => {
        if (isSignedIn) {
            loadCreditsData();
        } else {
            setCredit(null);
        }
    }, [isSignedIn]);

    const processImage = async (image) => {
        try {
            if (!isSignedIn) {
                return openSignIn();
            }

            setIsProcessing(true);
            setImage(image);
            setResultImage(false);
            navigate('/result');

            // Remove Background
            setProcessingStep('Removing background...');
            const token = await getToken();
            const formData = new FormData();
            formData.append('image', image);

            const { data } = await axios.post(
                `${backendUrl}/api/image/remove-bg`,
                formData,
                { headers: { token } }
            );

            if (!data.success) {
                throw new Error(data.message);
            }

            // Update state with background removed image
            setResultImage(data.resultImage);
            data.creditBalance && setCredit(data.creditBalance);
            toast.success('Background removed successfully!');
            
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error(error.message || 'Failed to process image');
            
            if (error.message.includes('credit') && credit === 0) {
                navigate('/buy');
            }
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
            toast.error('Face detection model is still loading');
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
        image, setImage,
        processImage,
        resultImage, setResultImage,
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

export default AppContextProvider