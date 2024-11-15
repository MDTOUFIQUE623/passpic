import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

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
    convertToPassport
  } = useContext(AppContext)
  
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [passportImage, setPassportImage] = useState(null)
  const [isConverting, setIsConverting] = useState(false)

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
      setPassportImage(null)
      await processImage(file)
    }
  }

  const handleDownload = (imageType) => {
    const imageToDownload = imageType === 'passport' ? passportImage : resultImage;
    if (imageToDownload) {
      const link = document.createElement('a')
      link.href = imageToDownload
      link.download = imageType === 'passport' ? 'passport_photo.jpg' : 'removed_background.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`${imageType === 'passport' ? 'Passport photo' : 'Image'} downloaded successfully!`)
    }
  }

  const handleConvertToPassport = async () => {
    try {
      setIsConverting(true);
      const passportImg = await convertToPassport(resultImage);
      setPassportImage(passportImg);
      toast.success('Converted to passport size successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to convert to passport size');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className='bg-[#0B1120] border border-gray-800 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-500'>
        {/* Credit Display */}
        <div className='mb-6 text-center'>
          <p className='text-neutral-200'>
            Credits Remaining: <span className='text-orange-400 font-bold'>{credit}</span>
          </p>
        </div>

        {/* Processing Status */}
        {(isProcessing || isConverting) && (
          <div className='text-center mb-4'>
            <p className='text-sm text-neutral-400 animate-pulse'>
              {isConverting ? 'Converting to passport size...' : processingStep || 'Processing...'}
            </p>
          </div>
        )}

        {/* Background Removed Image Section */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-neutral-200 mb-4'>Background Removed</h2>
          <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
            {/* Original Image */}
            <div className='group'>
              <p className='font-medium text-neutral-200 mb-3'>Original Photo</p>
              <div className='overflow-hidden rounded-xl border border-gray-800 group-hover:border-yellow-500/30 transition-all duration-500'>
                {image && (
                  <img 
                    className='w-full h-64 object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                    src={URL.createObjectURL(image)} 
                    alt="Original" 
                  />
                )}
              </div>
            </div>

            {/* Background Removed Image */}
            <div className='group'>
              <p className='font-medium text-neutral-200 mb-3'>Background Removed</p>
              <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-orange-500/30 transition-all duration-500 bg-layer h-64'>
                {isProcessing ? (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#0B1120]/50 backdrop-blur-sm'>
                    <div className='border-4 border-yellow-500 rounded-full h-12 w-12 border-t-transparent animate-spin mb-4'></div>
                    <p className='text-neutral-200 text-sm animate-pulse'>{processingStep}</p>
                  </div>
                ) : resultImage ? (
                  <img 
                    className='w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                    src={resultImage} 
                    alt="Background Removed" 
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Action Buttons for Background Removed Image */}
          <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-4'>
            <button 
              onClick={handleNewImage}
              disabled={isProcessing}
              className={`px-8 py-2.5 text-orange-400 text-sm border border-orange-400 rounded-full 
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-400/10 hover:scale-105'} 
                transition-all duration-300`}
            >
              New Image
            </button>
            
            <button 
              onClick={() => handleDownload('background')}
              disabled={!resultImage || isProcessing}
              className={`px-8 py-2.5 rounded-full text-sm
                ${!resultImage || isProcessing 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 cursor-pointer hover:scale-105'
                }
                transition-all duration-300`}
            >
              Download Image
            </button>

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
              Convert to Passport Size
            </button>
          </div>
        </div>

        {/* Passport Photo Section - Only shown after conversion */}
        {passportImage && (
          <div className='mt-12 pt-8 border-t border-gray-800'>
            <h2 className='text-xl font-semibold text-neutral-200 mb-4'>Passport Photo</h2>
            <div className='flex justify-center'>
              <div className='group max-w-md'>
                <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-blue-500/30 transition-all duration-500 bg-layer'>
                  <img 
                    className='w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                    src={passportImage} 
                    alt="Passport Size" 
                  />
                  <div className='absolute inset-0 border-2 border-blue-500/30 pointer-events-none'></div>
                </div>
                
                <button 
                  onClick={() => handleDownload('passport')}
                  className='mt-4 w-full px-8 py-2.5 rounded-full text-sm
                    bg-gradient-to-r from-blue-500 to-purple-500 
                    hover:from-purple-500 hover:to-blue-500 
                    transition-all duration-300 hover:scale-105'
                >
                  Download Passport Photo
                </button>
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
