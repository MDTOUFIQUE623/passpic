import React, { useState, useEffect, useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext';

const Header = () => {

  const { removeBg} = useContext(AppContext)

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='flex items-center justify-between max-sm:flex-col-reverse gap-y-10 px-4 mt-5 lg:px-44 sm:mt-10'>    
      {/* ---- Left Side ---- */}
      <div className='flex-1 -mt-8'>
        <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-bold text-neutral-200 leading-tight'>
            Professional <span className='bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent hover:from-orange-500 hover:to-yellow-500'>Passport Photos</span> <br className='max-md:hidden'/> 
            in <span className='bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent hover:from-orange-500 hover:to-yellow-500'>Seconds</span> <br className='max-md:hidden'/> 
            with AI Precision
        </h1>
        <p className='my-6 text-[15px] text-gray-400 hover:text-gray-300 transition-colors duration-300'>
          Transform any photo into a perfect passport-compliant image. <br className='max-sm:hidden'/>
          AI-powered background removal meets official requirements worldwide.
        </p>
        <div>
            <input onChange={ e => removeBg(e.target.files[0])} type="file" accept='image/*' id="upload1" hidden/>
            <label 
              className='inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30'
              htmlFor="upload1"
            >
                <img 
                  width={15} 
                  src={assets.upload_btn_icon} 
                  alt="" 
                  className='transition-transform duration-300 group-hover:rotate-12'
                />
                <p className='text-white text-sm'>Upload Your Photo</p>
            </label>
        </div>
      </div>

      {/* ---- Right Side ---- */}
      <div className='flex-1 relative w-full max-w-md'>
        <img 
          src={assets.header_img} 
          alt="Before" 
          className={`w-full absolute top-0 left-0 transition-opacity duration-700 ${
            isScrolled ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <img 
          src={assets.header_img1} 
          alt="After" 
          className={`w-full transition-opacity duration-700 ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  )
}

export default Header
