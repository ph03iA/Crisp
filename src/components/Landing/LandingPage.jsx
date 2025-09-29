import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setActiveTab } from '../../features/uiSlice'
import HeroSection from './HeroSection'

const LandingPage = () => {
  const dispatch = useDispatch()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleGetStarted = () => {
    setIsTransitioning(true)
    // Add a small delay for smooth transition
    setTimeout(() => {
      dispatch(setActiveTab('interviewee'))
      setIsTransitioning(false)
    }, 200)
  }

  const handleViewGitHub = () => {
    window.open('https://github.com/ph03iA/Crisp', '_blank')
  }

  return (
    <div className="min-h-screen">
      <HeroSection 
        onGetStarted={handleGetStarted}
        onViewDemo={handleViewGitHub}
        isTransitioning={isTransitioning}
      />
    </div>
  )
}

export default LandingPage
