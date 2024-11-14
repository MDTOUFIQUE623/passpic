import React from 'react'
import { testimonialsData } from '../assets/assets'

const Testimonials = () => {
  return (
    <div className='relative py-20'>
      {/* Title with gradient and animation */}
      <div className='text-center mb-16'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-200'>
          What Our Users Are 
          <span className='bg-gradient-to-r from-purple-500 to-orange-400 bg-clip-text text-transparent'> Saying</span>
        </h1>
        <p className='text-neutral-400 mt-4 max-w-2xl mx-auto px-4'>
          Join thousands of satisfied customers who have transformed their photos with our AI-powered solution
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4'>
        {testimonialsData.map((item, index) => (
          <div 
            className='group' 
            key={index}
          >
            {/* Card content */}
            <div className='bg-[#0B1120] border border-gray-800 rounded-xl p-8 
              hover:border-orange-500/30 transition-all duration-500 
              group-hover:transform group-hover:scale-[1.02]'
            >
              {/* Testimonial text */}
              <p className='text-neutral-300 mb-6 leading-relaxed group-hover:text-neutral-200 transition-colors duration-300'>
                {item.text}
              </p>
              
              {/* Author info with hover effects */}
              <div className='flex items-center gap-4'>
                <div className='relative w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500/30 transition-all duration-300'>
                  <img 
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' 
                    src={item.image} 
                    alt={item.author} 
                  />
                </div>
                <div>
                  <p className='font-medium text-neutral-200 group-hover:text-orange-400 transition-colors duration-300'>
                    {item.author}
                  </p>
                  <p className='text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300'>
                    {item.jobTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonials
