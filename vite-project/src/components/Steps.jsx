import React from 'react'
import { assets } from '../assets/assets'

const Steps = () => {
  return (
    <div className='mx-4 lg:mx-44 py-20 xl:py-40'>
        <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold text-neutral-200'>
          Create Perfect Passport Photos <br /> 
          in <span className='bg-gradient-to-r from-purple-500 to-orange-400 bg-clip-text text-transparent'>Three Simple Steps</span>
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-4'>
            {/* Step 1 */}
            <div className='group relative w-full'>
                <div className='absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-600/10 blur-md group-hover:blur-lg transition-all duration-300'></div>
                <div className='relative h-full flex flex-col items-center gap-4 bg-[#0B1120]/90 border border-gray-800 p-8 rounded-lg 
                    hover:border-orange-500/30 transition-all duration-500 
                    group-hover:transform group-hover:scale-[1.01]'>
                    <div className='w-16 h-16 flex items-center justify-center rounded-full p-3'>
                        <img className='w-10 h-10 group-hover:scale-105 transition-transform duration-300' src={assets.upload_icon} alt="" />
                    </div>
                    <div className='text-center'>
                        <p className='text-xl font-medium text-neutral-200'>1. Select Your Photo</p>
                        <p className='text-sm text-neutral-400 mt-2 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300'>
                            Simply upload any portrait photo from your device - it's that easy
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 2 */}
            <div className='group relative w-full'>
                <div className='absolute inset-0 bg-gradient-to-r from-purple-600/10 to-orange-500/10 blur-md group-hover:blur-lg transition-all duration-300'></div>
                <div className='relative h-full flex flex-col items-center gap-4 bg-[#0B1120]/90 border border-gray-800 p-8 rounded-lg 
                    hover:border-purple-600/30 transition-all duration-500 
                    group-hover:transform group-hover:scale-[1.01]'>
                    <div className='w-16 h-16 flex items-center justify-center rounded-full p-3'>
                        <img className='w-10 h-10 group-hover:scale-105 transition-transform duration-300' src={assets.remove_bg_icon} alt="" />
                    </div>
                    <div className='text-center'>
                        <p className='text-xl font-medium text-neutral-200'>
                            2. <span className='bg-gradient-to-r from-purple-500 to-orange-400 bg-clip-text text-transparent'>AI Magic</span> Happens
                        </p>
                        <p className='text-sm text-neutral-400 mt-2 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300'>
                            Our AI instantly removes the background with professional precision
                        </p>
                    </div>
                </div>
            </div>

            {/* Step 3 */}
            <div className='group relative w-full'>
                <div className='absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 blur-md group-hover:blur-lg transition-all duration-300'></div>
                <div className='relative h-full flex flex-col items-center gap-4 bg-[#0B1120]/90 border border-gray-800 p-8 rounded-lg 
                    hover:border-yellow-500/30 transition-all duration-500 
                    group-hover:transform group-hover:scale-[1.01]'>
                    <div className='w-16 h-16 flex items-center justify-center rounded-full p-3'>
                        <img className='w-10 h-10 group-hover:scale-105 transition-transform duration-300' src={assets.download_icon} alt="" />
                    </div>
                    <div className='text-center'>
                        <p className='text-xl font-medium text-neutral-200'>3. Get Your Photo</p>
                        <p className='text-sm text-neutral-400 mt-2 leading-relaxed group-hover:text-neutral-300 transition-colors duration-300'>
                            Download your perfectly sized passport photo, ready for official use anywhere
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
  )
}

export default Steps
