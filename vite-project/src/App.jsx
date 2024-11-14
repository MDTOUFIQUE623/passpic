import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className='min-h-screen bg-[#0B1120] relative overflow-hidden'>
      {/* Enhanced animated background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-600/30 to-orange-500/20 blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-t from-yellow-500/10 to-purple-600/20 blur-[120px] animate-floating" />
      
      {/* Cyberpunk grid patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute inset-0 bg-cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,#0B1120_100%)] z-[1]" />
      
      {/* Animated scan line effect */}
      <div className="absolute inset-0 bg-scan-lines opacity-[0.02]" />
      
      {/* Content container with enhanced glass effect */}
      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-[#0B1120]/30">
        {/* Cyberpunk corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-orange-500/20 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-purple-600/20 rounded-br-3xl" />
        
        <Navbar />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/result' element={<Result/>} />
          <Route path='/buy' element={<BuyCredit/>} />
        </Routes>
        <Footer />
      </div>
    </div>
  )
}

export default App
