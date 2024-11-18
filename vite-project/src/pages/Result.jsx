import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { changePassportBackground } from '../utils/faceDetection'
import { enhanceImage } from '../utils/imageEnhancement'

const Result = () => {
  const { 
    image, 
    resultImage, 
    credit, 
    processImage,
    setImage, 
    setResultImage,
    isProcessing,
    processingStep,
    isConverting,
    passportImage,
    handleConvertToPassport,
  } = useContext(AppContext)
  
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [selectedBackground, setSelectedBackground] = useState('#FFFFFF')
  const [customizedPassport, setCustomizedPassport] = useState(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedPassport, setEnhancedPassport] = useState(null)
  const [isEnhanced, setIsEnhanced] = useState(false)
  const [isChangingBackground, setIsChangingBackground] = useState(false)

  // Redirect if no image is selected
  useEffect(() => {
    if (!image) {
      navigate('/')
    }
  }, [image, navigate])

  useEffect(() => {
    if (passportImage) {
      setCustomizedPassport(null);
      setEnhancedPassport(null);
      setSelectedBackground('#FFFFFF');
      setIsEnhanced(false);
      setIsChangingBackground(false);
    }
  }, [passportImage]);

  const handleNewImage = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size should be less than 30MB');
        return;
      }

      setImage(file)
      setResultImage(false)
      await processImage(file)
    }
  }

  const handleDownload = (imageType) => {
    let imageToDownload;
    let fileName;
    let fileExtension;

    if (imageType === 'passport') {
        // Create a temporary canvas for high-quality export
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            // Set canvas size to 35mm x 45mm at 300 DPI
            // 35mm = 413 pixels, 45mm = 531 pixels at 300 DPI
            canvas.width = 413;
            canvas.height = 531;

            // Enable high-quality image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw the image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Create download link
            const link = document.createElement('a');
            
            // Use PNG for transparent backgrounds, high-quality JPEG for colored backgrounds
            if (selectedBackground === 'transparent') {
                link.href = canvas.toDataURL('image/png', 1.0);
                link.download = `passport_photo${enhancedPassport ? '_enhanced' : ''}.png`;
            } else {
                link.href = canvas.toDataURL('image/jpeg', 1.0);
                link.download = `passport_photo${enhancedPassport ? '_enhanced' : ''}.jpg`;
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Load the current passport image
        img.src = enhancedPassport || customizedPassport || passportImage;
    } else {
        // For background removed image, use PNG with maximum quality
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'removed_background.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleBackgroundChange = async (color) => {
    if (!passportImage || isEnhanced) {
        if (isEnhanced) {
            toast.info('Cannot change background after enhancement. Please convert image again to make changes.');
        }
        return;
    }
    
    try {
        if (isChangingBackground) return;
        setIsChangingBackground(true);

        setSelectedBackground(color);
        const sourceImage = passportImage;
        const newImage = await changePassportBackground(sourceImage, color);
        
        setCustomizedPassport(newImage);
    } catch (error) {
        console.error('Error changing background:', error);
        toast.error('Failed to change background color');
    } finally {
        setTimeout(() => {
            setIsChangingBackground(false);
        }, 500);
    }
  };

  const handleEnhanceImage = async () => {
    if (!passportImage || isEnhanced) return;
    
    try {
        setIsEnhancing(true);
        const imageToEnhance = customizedPassport || passportImage;
        const enhanced = await enhanceImage(imageToEnhance);
        
        const withBackground = await changePassportBackground(enhanced, selectedBackground);
        setEnhancedPassport(withBackground);
        setCustomizedPassport(withBackground);
        
        setIsEnhanced(true);
        toast.success('Image enhanced successfully');
    } catch (error) {
        console.error('Error enhancing image:', error);
        toast.error('Failed to enhance image');
    } finally {
        setIsEnhancing(false);
    }
  };

  useEffect(() => {
    if (isConverting) {
      setEnhancedPassport(null);
      setCustomizedPassport(null);
      setSelectedBackground('#FFFFFF');
    }
  }, [isConverting]);

  const EnhancementBadge = () => (
    <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
        Enhanced
    </div>
  );

  return (
    <div className='min-h-screen bg-dark'>
      <div className='w-full max-w-6xl mx-auto px-4 py-8'>
        <input 
          type="file"
          accept='image/*'
          onChange={handleFileChange}
          ref={fileInputRef}
          className='hidden'
        />

        {/* Credit Display */}
        <div className='text-center mb-8'>
          <p className='text-neutral-400'>
            Credits Remaining: 
            <span className='text-white font-medium ml-2'>{credit}</span>
          </p>
        </div>

        {/* Image Display Section */}
        <div className='grid md:grid-cols-2 gap-8'>
          {/* Original Image */}
          <div className='group'>
            <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-purple-500/30 transition-all duration-500'>
              <img 
                className='w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                src={image instanceof File ? URL.createObjectURL(image) : (image || '')} 
                alt="Original" 
              />
              <div className='absolute inset-0 border-2 border-purple-500/30 pointer-events-none'></div>
            </div>
            <p className='text-center text-neutral-400 mt-2'>Original Image</p>
          </div>

          {/* Result Image */}
          <div className='group'>
            <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-blue-500/30 transition-all duration-500'>
              {isProcessing ? (
                <div className='aspect-square flex items-center justify-center bg-gray-900/50'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent'></div>
                    <p className='text-neutral-400 text-sm'>{processingStep}</p>
                  </div>
                </div>
              ) : resultImage ? (
                <img 
                  className='w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                  src={resultImage || ''} 
                  alt="Result" 
                />
              ) : (
                <div className='aspect-square flex items-center justify-center bg-gray-900/50'>
                  <p className='text-neutral-400'>Processing will start soon...</p>
                </div>
              )}
              <div className='absolute inset-0 border-2 border-blue-500/30 pointer-events-none'></div>
            </div>
            <p className='text-center text-neutral-400 mt-2'>Background Removed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-8'>
          <button 
            onClick={handleNewImage}
            className='px-8 py-2.5 rounded-full text-sm
              bg-gradient-to-r from-orange-500 to-yellow-500 
              hover:from-yellow-500 hover:to-orange-500 
              transition-all duration-300 hover:scale-105'
          >
            Try Another Image
          </button>

          {resultImage && (
            <button 
              onClick={() => handleDownload('result')}
              className='px-8 py-2.5 rounded-full text-sm
                bg-gradient-to-r from-green-500 to-emerald-500 
                hover:from-emerald-500 hover:to-green-500 
                transition-all duration-300 hover:scale-105'
            >
              Download Image
            </button>
          )}

          <button 
            onClick={handleConvertToPassport}
            disabled={!resultImage || isProcessing || isConverting}
            className={`px-8 py-2.5 rounded-full text-sm
              ${!resultImage || isProcessing || isConverting
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 cursor-pointer hover:scale-105'
              }
              transition-all duration-300`}
          >
            {isConverting ? 'Converting...' : 'Convert to Passport Size'}
          </button>
        </div>

        {/* Passport Photo Section */}
        {passportImage && (
          <div className='mt-12 pt-8 border-t border-gray-800'>
            <h2 className='text-xl font-semibold text-neutral-200 mb-4'>Passport Photo</h2>
            <div className='flex flex-col md:flex-row gap-8'>
              {/* Passport Photo Display */}
              <div className='flex-1'>
                <div className='group max-w-md'>
                  <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-blue-500/30 transition-all duration-500'>
                    <img 
                      className='w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                      src={customizedPassport || enhancedPassport || passportImage} 
                      alt="Passport Size" 
                    />
                    {enhancedPassport && <EnhancementBadge />}
                    <div className='absolute inset-0 border-2 border-blue-500/30 pointer-events-none'></div>
                  </div>
                  
                  <div className='flex gap-4 mt-4'>
                    <button 
                      onClick={() => handleDownload('passport')}
                      className='flex-1 px-8 py-2.5 rounded-full text-sm
                        bg-gradient-to-r from-blue-500 to-purple-500 
                        hover:from-purple-500 hover:to-blue-500 
                        transition-all duration-300 hover:scale-105'
                    >
                      Download Photo
                    </button>

                    <button 
                      onClick={handleEnhanceImage}
                      disabled={isEnhancing || !passportImage || isEnhanced || selectedBackground === '#FFFFFF'}
                      className={`flex-1 px-8 py-2.5 rounded-full text-sm
                        ${isEnhancing || !passportImage || isEnhanced || selectedBackground === '#FFFFFF'
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-green-500 hover:to-emerald-500'
                        } transition-all duration-300 hover:scale-105`}
                      title={selectedBackground === '#FFFFFF' ? 'Please select a background color first' : ''}
                    >
                      {isEnhancing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enhancing...</span>
                        </div>
                      ) : isEnhanced ? (
                        'Already Enhanced'
                      ) : selectedBackground === '#FFFFFF' ? (
                        'Select Background First'
                      ) : (
                        'Enhance Quality'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Color Panel */}
              <div className='w-full md:w-64 bg-gray-900/50 rounded-xl p-4'>
                <h3 className='text-lg font-medium text-neutral-200 mb-4'>
                  Background Color
                </h3>
                <div className='space-y-3'>
                  {/* Custom Color Input */}
                  <div>
                    <label className='text-sm text-neutral-400 block mb-2'>
                      Select Background Color
                    </label>
                    <input 
                      type="color" 
                      value={selectedBackground === 'transparent' ? '#FFFFFF' : selectedBackground}
                      onChange={(e) => handleBackgroundChange(e.target.value)}
                      disabled={isEnhanced}
                      className={`w-full h-12 rounded cursor-pointer ${isEnhanced ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {isEnhanced ? (
                      <p className="text-xs text-orange-400 mt-2">
                        Background cannot be changed after enhancement
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 mt-2">
                        Click to choose your preferred background color
                      </p>
                    )}
                  </div>

                  {/* Transparent Option */}
                  <button
                    onClick={() => handleBackgroundChange('transparent')}
                    disabled={isChangingBackground || isEnhanced}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 
                      ${(isChangingBackground || isEnhanced) ? 'opacity-50 cursor-not-allowed' : ''}
                      ${selectedBackground === 'transparent' 
                        ? 'bg-blue-500/20 border border-blue-500/50' 
                        : 'hover:bg-gray-800/50 border border-gray-700'}`}
                    title={isEnhanced ? 'Cannot change background after enhancement' : ''}
                  >
                    <div className='w-6 h-6 rounded border border-gray-600 repeating-crisscross-pattern'/>
                    <span className='text-sm text-neutral-300'>
                      Transparent
                    </span>
                    {isEnhanced && selectedBackground === 'transparent' && (
                      <span className="ml-auto text-xs text-green-400">✓</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Guidelines */}
        <div className='mt-8 p-4 bg-blue-500/10 rounded-lg'>
          <h3 className='text-blue-400 font-medium mb-2'>Passport Photo Guidelines</h3>
          <ul className='text-sm text-neutral-400 space-y-1'>
            <li>• Photo dimensions: 35mm × 45mm</li>
            <li>• Face takes up 70-80% of height</li>
            <li>• Centered, front-facing pose</li>
            <li>• White background</li>
            <li>• Clear, sharp, and in color</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Result
