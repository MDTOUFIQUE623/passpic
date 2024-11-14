import React, { useState } from 'react'
import { assets } from '../assets/assets'

const Result = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleNewImage = () => {
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      <div className='bg-[#0B1120] border border-gray-800 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-500'>
        {/* Image Container */}
        <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
          {/* Left Side - Original */}
          <div className='group'>
            <p className='font-medium text-neutral-200 mb-3'>Original Photo</p>
            <div className='overflow-hidden rounded-xl border border-gray-800 group-hover:border-yellow-500/30 transition-all duration-500'>
              <img 
                className='w-full rounded-xl transition-transform duration-500 group-hover:scale-105' 
                src={assets.image_w_bg} 
                alt="Original" 
              />
            </div>
          </div>

          {/* Right Side - Processed */}
          <div className='group'>
            <p className='font-medium text-neutral-200 mb-3'>Background Removed</p>
            <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-orange-500/30 transition-all duration-500 bg-layer'>
              {isLoading ? (
                <div className='absolute inset-0 flex items-center justify-center bg-[#0B1120]/50 backdrop-blur-sm'>
                  <div className='border-4 border-yellow-500 rounded-full h-12 w-12 border-t-transparent animate-spin'></div>
                </div>
              ) : (
                <img 
                  className='w-full rounded-xl transition-transform duration-500 group-hover:scale-105' 
                  src={assets.image_wo_bg} 
                  alt="Processed" 
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-8'>
          <button 
            onClick={handleNewImage}
            className='px-8 py-2.5 text-orange-400 text-sm border border-orange-400 rounded-full 
              hover:bg-orange-400/10 hover:scale-105 transition-all duration-300'
          >
            New Image
          </button>
          
          <button 
            className='px-8 py-2.5 rounded-full cursor-pointer text-white
              bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 
              transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30'
          >
            Download Image
          </button>
        </div>
      </div>
    </div>
  )
}

export default Result
