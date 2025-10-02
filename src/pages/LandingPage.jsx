import React from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/Landing/HeroSection'

const LandingPage = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/upload')
  }

  const handleViewGitHub = () => {
    window.open('https://github.com/ph03iA/Crisp', '_blank')
  }

  return (
    <div className="min-h-screen">
      <HeroSection 
        onGetStarted={handleGetStarted}
        onViewDemo={handleViewGitHub}
        isTransitioning={false}
      />
    </div>
  )
}

export default LandingPage
