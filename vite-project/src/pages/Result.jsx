import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { changePassportBackground } from '../utils/faceDetection'

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

  const backgroundOptions = [
    { label: 'White', value: '#FFFFFF' },
    { label: 'Blue', value: '#0729D5' },
    { label: 'Gray', value: '#C0C0C0' },
    { label: 'Yellow', value: '#EBC22D' },
    { label: 'Transparent', value: 'transparent' },
  ]

  // Redirect if no image is selected
  useEffect(() => {
    if (!image) {
      navigate('/')
    }
  }, [image, navigate])

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

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
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
        imageToDownload = customizedPassport || passportImage;
        fileName = 'passport_photo';
        fileExtension = selectedBackground === 'transparent' ? 'png' : 'jpg';
    } else {
        imageToDownload = resultImage;
        fileName = 'removed_background';
        fileExtension = 'png';
    }

    if (imageToDownload) {
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `${fileName}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  const handleBackgroundChange = async (color) => {
    if (!passportImage) return;
    
    try {
        setSelectedBackground(color);
        const newImage = await changePassportBackground(passportImage, color);
        setCustomizedPassport(newImage);
    } catch (error) {
        console.error('Error changing background:', error);
    }
  };

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
                src={image instanceof File ? URL.createObjectURL(image) : image} 
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
                  src={resultImage} 
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
                      src={customizedPassport || passportImage} 
                      alt="Passport Size" 
                    />
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
                  </div>
                </div>
              </div>

              {/* Background Color Panel */}
              <div className='w-full md:w-64 bg-gray-900/50 rounded-xl p-4'>
                <h3 className='text-lg font-medium text-neutral-200 mb-4'>
                  Background Color
                </h3>
                <div className='space-y-3'>
                  {backgroundOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBackgroundChange(option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 
                        ${selectedBackground === option.value 
                          ? 'bg-blue-500/20 border border-blue-500/50' 
                          : 'hover:bg-gray-800/50 border border-gray-700'}`}
                    >
                      <div 
                        className={`w-6 h-6 rounded border border-gray-600 ${
                          option.value === 'transparent' ? 'repeating-crisscross-pattern' : ''
                        }`}
                        style={{
                          backgroundColor: option.value === 'transparent' ? 'transparent' : option.value,
                        }}
                      />
                      <span className='text-sm text-neutral-300'>
                        {option.label}
                      </span>
                    </button>
                  ))}
                  
                  {/* Custom Color Input */}
                  <div className='mt-4'>
                    <label className='text-sm text-neutral-400 block mb-2'>
                      Custom Color
                    </label>
                    <input 
                      type="color" 
                      value={selectedBackground === 'transparent' ? '#FFFFFF' : selectedBackground}
                      onChange={(e) => handleBackgroundChange(e.target.value)}
                      className='w-full h-10 rounded cursor-pointer'
                    />
                  </div>
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
