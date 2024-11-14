import React, { useState } from 'react'
import { assets, plans } from '../assets/assets'

const BuyCredit = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')

  const features = {
    free: {
      credits: '5 Credits',
      quality: 'Standard Quality',
      speed: 'Normal Processing',
      size: '5MB Upload Limit'
    },
    basic: {
      credits: '100 Credits',
      quality: 'High Quality',
      speed: 'Fast Processing',
      size: '10MB Upload Limit'
    },
    advanced: {
      credits: '500 Credits',
      quality: 'Premium Quality',
      speed: 'Priority Processing',
      size: '15MB Upload Limit'
    },
    business: {
      credits: '5000 Credits',
      quality: 'Enterprise Quality',
      speed: 'Instant Processing',
      size: '25MB Upload Limit'
    }
  }

  return (
    <div className='min-h-[80vh] py-20 px-4'>
      {/* Header Section */}
      <div className='text-center mb-16'>
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-200 mb-6'>
          Choose Your Perfect <span className='bg-gradient-to-r from-purple-500 to-orange-400 bg-clip-text text-transparent'>Plan</span>
        </h1>
        <p className='text-neutral-400 max-w-2xl mx-auto'>
          Select the ideal plan for your passport photo needs. All plans include our AI-powered background removal and size optimization.
        </p>

        {/* Billing Toggle */}
        <div className='flex items-center justify-center gap-4 mt-8 mb-12'>
          <div className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 
            ${billingCycle === 'monthly' ? 'bg-gradient-to-r from-purple-500 to-orange-400 text-white' : 'text-neutral-400'}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </div>
          <div className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 
            ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-purple-500 to-orange-400 text-white' : 'text-neutral-400'}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className='ml-2 text-xs bg-gradient-to-r from-purple-500 to-orange-400 text-white px-2 py-0.5 rounded-full'>Save 20%</span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto'>
        {/* Free Plan */}
        <div className='group relative'>
          <div className='relative bg-[#0B1120] border border-gray-800 rounded-xl p-6 
            hover:border-purple-500/30 transition-all duration-500 
            group-hover:transform group-hover:scale-[1.02]'
          >
            <div className='mb-8'>
              <h3 className='text-xl font-semibold text-neutral-200 mb-2'>Free</h3>
              <p className='text-sm text-neutral-400'>Perfect for trying out our service</p>
            </div>
            <div className='mb-6'>
              <span className='text-3xl font-bold text-neutral-200'>$0</span>
              <span className='text-neutral-400'>/month</span>
            </div>
            <button className='w-full py-2 px-4 rounded-lg border border-gray-700 text-neutral-200 
              hover:bg-gray-800 transition-all duration-300 mb-6'>
              Get Started
            </button>
            <div className='space-y-3'>
              {Object.entries(features.free).map(([key, value]) => (
                <div key={key} className='flex items-center gap-2 text-sm text-neutral-400'>
                  <span className='text-green-400'>✓</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Basic Plan */}
        <div className='group relative'>
          <div className='relative bg-[#0B1120] border border-gray-800 rounded-xl p-6 
            hover:border-orange-500/30 transition-all duration-500 
            group-hover:transform group-hover:scale-[1.02]'
          >
            <div className='mb-8'>
              <h3 className='text-xl font-semibold text-neutral-200 mb-2'>Basic</h3>
              <p className='text-sm text-neutral-400'>Best for personal use</p>
            </div>
            <div className='mb-6'>
              <span className='text-3xl font-bold text-neutral-200'>
                ${billingCycle === 'yearly' ? '8' : '10'}
              </span>
              <span className='text-neutral-400'>/month</span>
            </div>
            <button className='w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-orange-400 text-white 
              hover:from-orange-400 hover:to-purple-500 transition-all duration-300 mb-6'>
              Choose Basic
            </button>
            <div className='space-y-3'>
              {Object.entries(features.basic).map(([key, value]) => (
                <div key={key} className='flex items-center gap-2 text-sm text-neutral-400'>
                  <span className='text-green-400'>✓</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Plan */}
        <div className='group relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-500/20 rounded-xl blur-md'></div>
          <div className='relative bg-[#0B1120] border border-purple-500/30 rounded-xl p-6 
            hover:border-orange-500/30 transition-all duration-500 
            group-hover:transform group-hover:scale-[1.02]'
          >
            <div className='absolute -top-3 right-4 bg-gradient-to-r from-purple-500 to-orange-400 text-white text-sm px-3 py-1 rounded-full'>
              Most Popular
            </div>
            <div className='mb-8'>
              <h3 className='text-xl font-semibold text-neutral-200 mb-2'>Advanced</h3>
              <p className='text-sm text-neutral-400'>Best for business use</p>
            </div>
            <div className='mb-6'>
              <span className='text-3xl font-bold text-neutral-200'>
                ${billingCycle === 'yearly' ? '40' : '50'}
              </span>
              <span className='text-neutral-400'>/month</span>
            </div>
            <button className='w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-orange-400 text-white 
              hover:from-orange-400 hover:to-purple-500 transition-all duration-300 mb-6'>
              Choose Advanced
            </button>
            <div className='space-y-3'>
              {Object.entries(features.advanced).map(([key, value]) => (
                <div key={key} className='flex items-center gap-2 text-sm text-neutral-400'>
                  <span className='text-green-400'>✓</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Plan */}
        <div className='group relative'>
          <div className='relative bg-[#0B1120] border border-gray-800 rounded-xl p-6 
            hover:border-purple-500/30 transition-all duration-500 
            group-hover:transform group-hover:scale-[1.02]'
          >
            <div className='mb-8'>
              <h3 className='text-xl font-semibold text-neutral-200 mb-2'>Business</h3>
              <p className='text-sm text-neutral-400'>Best for enterprise use</p>
            </div>
            <div className='mb-6'>
              <span className='text-3xl font-bold text-neutral-200'>
                ${billingCycle === 'yearly' ? '200' : '250'}
              </span>
              <span className='text-neutral-400'>/month</span>
            </div>
            <button className='w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-orange-400 text-white 
              hover:from-orange-400 hover:to-purple-500 transition-all duration-300 mb-6'>
              Choose Business
            </button>
            <div className='space-y-3'>
              {Object.entries(features.business).map(([key, value]) => (
                <div key={key} className='flex items-center gap-2 text-sm text-neutral-400'>
                  <span className='text-green-400'>✓</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyCredit
