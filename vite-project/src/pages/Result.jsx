import React, { useContext, useEffect, useRef } from 'react'
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
    processingStep
  } = useContext(AppContext)
  
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

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
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImage(file)
      setResultImage(false)
      await processImage(file)
    }
  }

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a')
      link.href = resultImage
      link.download = 'passport_photo.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Photo downloaded successfully!')
    }
  }

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      {/* Hidden file input */}
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
        {isProcessing && (
          <div className='text-center mb-4'>
            <p className='text-sm text-neutral-400 animate-pulse'>
              {processingStep || 'Processing...'}
            </p>
          </div>
        )}

        {/* Image Container */}
        <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
          {/* Left Side - Original */}
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

          {/* Right Side - Processed */}
          <div className='group'>
            <p className='font-medium text-neutral-200 mb-3'>Passport Photo</p>
            <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-orange-500/30 transition-all duration-500 bg-layer h-64'>
              {isProcessing ? (
                <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#0B1120]/50 backdrop-blur-sm'>
                  <div className='border-4 border-yellow-500 rounded-full h-12 w-12 border-t-transparent animate-spin mb-4'></div>
                  <p className='text-neutral-200 text-sm animate-pulse'>{processingStep}</p>
                </div>
              ) : resultImage ? (
                <div className='relative w-full h-full flex items-center justify-center bg-neutral-900'>
                  <img 
                    className='h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105' 
                    src={resultImage} 
                    alt="Passport Photo" 
                  />
                  {/* Size Guide Overlay */}
                  <div className='absolute inset-0 border-2 border-blue-500/30 pointer-events-none'></div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-8'>
          <button 
            onClick={handleNewImage}
            disabled={isProcessing}
            className={`px-8 py-2.5 text-orange-400 text-sm border border-orange-400 rounded-full 
              ${isProcessing 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-orange-400/10 hover:scale-105'} 
              transition-all duration-300`}
          >
            New Image
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={!resultImage || isProcessing}
            className={`px-8 py-2.5 rounded-full text-sm
              ${!resultImage || isProcessing 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 cursor-pointer hover:scale-105'
              }
              transition-all duration-300`}
          >
            {isProcessing ? 'Processing...' : 'Download Passport Photo'}
          </button>
        </div>

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
