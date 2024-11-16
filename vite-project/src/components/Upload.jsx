import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Upload = () => {
  const { processImage } = useContext(AppContext)

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      processImage(file);
    }
  };

  return (
    <div className='pb-16'>
      {/* Title */}
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl font-semibold text-neutral-200 py-6 md:p16'>
        Create your passport photo. 
        <span className='bg-gradient-to-r from-purple-500 to-orange-400 bg-clip-text text-transparent'> Try now </span>
      </h1>

      <div className='text-center mb-24 py-6'>
        <input 
          onChange={handleImageUpload} 
          type="file" 
          accept='image/*' 
          id="upload2" 
          hidden
        />
        <label 
          className='inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer 
            bg-gradient-to-r from-yellow-500 to-orange-500 
            hover:from-orange-500 hover:to-yellow-500 
            transition-all duration-300 hover:scale-105 
            hover:shadow-lg hover:shadow-orange-500/30'
          htmlFor="upload2"
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
  )
}

export default Upload
