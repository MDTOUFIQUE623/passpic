import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'

const Navbar = () => {

    const { openSignIn } = useClerk()
    const { isSignedIn, user } = useUser()

  return (
    <div className='flex items-center justify-between mx-4 py-1 lg:mx-44 mt-[-8px]'>
        <Link to='/'>
            <img className='w-32 sm:w-44' src={assets.logo} alt="" />
        </Link>
        {
            isSignedIn?<div>
               <UserButton />
            </div>:<button onClick={()=>openSignIn({})} className='relative group overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-900 text-white flex items-center gap-4 px-4 py-2 sm:px-8 sm:py-3 text-sm rounded-full border border-zinc-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20'>
            {/* Animated background */}
            <div className='absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            
            {/* Glitch effect line */}
            <div className='absolute h-[1px] w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent top-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
            
            {/* Content */}
            <span className='relative z-10 bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent font-medium'>Get Started</span>
            <img 
                className='w-3 sm:w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1' 
                src={assets.arrow_icon} 
                alt="" 
            />
            
            {/* Cyberpunk corner accents */}
            <div className='absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            <div className='absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
        </button>

        }
        
    </div>
  )
}

export default Navbar
