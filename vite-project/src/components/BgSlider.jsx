import React, { useState } from 'react'
import { assets } from '../assets/assets'

const BgSlider = () => {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)

    const handleSliderChange = (e) => {
        setSliderPosition(e.target.value)
    }

    return (
        <div className='pb-10 md:py-20 mx-2'>
            {/* Title */}
            <h1 className='mb-12 sm:mb-20 text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold text-neutral-200'>
                Remove Background with High <br /> 
                <span className='bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent hover:from-orange-500 hover:to-yellow-500 transition-all duration-300'>
                    AI Precision
                </span>
            </h1>

            {/* Slider Container */}
            <div className='relative w-full max-w-3xl mx-auto group'>
                {/* Background Glow Effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                {/* Image Container */}
                <div className='relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-pink-500/30 transition-all duration-500'>
                    {/* Background Image */}
                    <img 
                        src={assets.image_w_bg} 
                        style={{clipPath: `inset(0 ${100.2 - sliderPosition}% 0 0)`}} 
                        alt="Original"
                        className='transition-transform duration-300'
                    />

                    {/* Foreground Image */}
                    <img 
                        className='absolute top-0 left-0 w-full h-full transition-transform duration-300' 
                        src={assets.image_wo_bg} 
                        style={{clipPath: `inset(0 0 0 ${sliderPosition}%)`}} 
                        alt="Processed"
                    />

                    {/* Slider Line */}
                    <div 
                        className='absolute top-0 bottom-0 w-0.5 bg-pink-500/70 backdrop-blur-sm'
                        style={{ left: `${sliderPosition}%` }}
                    >
                        {/* Slider Handle */}
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full cursor-grab active:cursor-grabbing border-2 border-white/20 shadow-lg
                            hover:scale-110 transition-all duration-300'
                        >
                            {/* Arrow Icons */}
                            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 text-white/70'>
                                <span>←</span>
                                <span>→</span>
                            </div>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className='absolute top-4 left-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-sm text-white/70'>
                        Original
                    </div>
                    <div className='absolute top-4 right-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-sm text-white/70'>
                        Processed
                    </div>
                </div>

                {/* Slider Input */}
                <input 
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full z-10 slider opacity-0 cursor-grab active:cursor-grabbing' 
                    type="range" 
                    min={0} 
                    max={100} 
                    value={sliderPosition} 
                    onChange={handleSliderChange}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                />
            </div>
        </div>
    )
}

export default BgSlider
