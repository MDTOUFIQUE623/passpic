import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import upload_btn_icon from '../assets/upload_btn_icon.svg'

const Upload = () => {
  const { processImage } = useContext(AppContext)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Check if it's an image file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error('Please upload a JPG, PNG, or WEBP image');
        e.target.value = '';
        return;
      }

      // Check file size (30MB limit for ClipDrop API)
      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size should be less than 30MB');
        e.target.value = '';
        return;
      }

      await processImage(file);
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error('Failed to process image. Please try again');
      e.target.value = '';
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
          accept="image/jpeg,image/jpg,image/png,image/webp"
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
            src={upload_btn_icon} 
            alt="Upload" 
            className='transition-transform duration-300 group-hover:rotate-12'
          />
          <p className='text-white text-sm'>Upload Your Photo</p>
        </label>
        <div className='mt-4 text-neutral-400 text-sm'>
          Supported formats: JPG, PNG, WEBP (max 25MB)
        </div>
      </div>
    </div>
  )
}

export default Upload
