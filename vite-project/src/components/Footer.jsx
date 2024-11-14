import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  const socialIcons = [
    { icon: assets.facebook_icon, name: 'Facebook' },
    { icon: assets.twitter_icon, name: 'Twitter' },
    { icon: assets.google_plus_icon, name: 'Google Plus' }
  ]

  return (
    <footer className='relative border-t border-gray-800'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-6 px-4 lg:px-44 py-6'>
        {/* Logo Section */}
        <div className='transition-transform duration-300 hover:scale-105'>
          <img 
            width={150} 
            src={assets.logo} 
            alt="Passpic.dev Logo" 
            className='brightness-90 hover:brightness-100 transition-all duration-300'
          />
        </div>

        {/* Copyright Text */}
        <p className='text-sm text-gray-500 hover:text-gray-400 transition-colors duration-300 text-center md:text-left'>
          Copyright © {new Date().getFullYear()} Passpic.dev | All Rights Reserved.
        </p>

        {/* Social Icons */}
        <div className='flex gap-4 items-center'>
          {socialIcons.map((social, index) => (
            <div
              key={index}
              className='group relative cursor-pointer'
            >
              {/* Hover effect background */}
              <div className='absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              
              {/* Icon */}
              <div className='relative w-10 h-10 flex items-center justify-center rounded-full border border-gray-800 bg-[#0B1120] 
                hover:border-orange-500/30 transition-all duration-300 group-hover:transform group-hover:scale-110'
              >
                <img 
                  width={24} 
                  height={24} 
                  src={social.icon} 
                  alt={social.name}
                  className='opacity-70 group-hover:opacity-100 transition-opacity duration-300' 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
