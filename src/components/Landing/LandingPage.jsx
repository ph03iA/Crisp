import React from 'react'
import { useDispatch } from 'react-redux'
import { setActiveTab } from '../../features/uiSlice'
import HeroSection from './HeroSection'

const LandingPage = () => {
  const dispatch = useDispatch()

  const handleGetStarted = () => {
    dispatch(setActiveTab('interviewee'))
  }

  const handleViewGitHub = () => {
    window.open('https://github.com/ph03iA/Crisp', '_blank')
  }

  return (
    <div className="min-h-screen">
      <HeroSection 
        onGetStarted={handleGetStarted}
        onViewDemo={handleViewGitHub}
      />
    </div>
  )
}

export default LandingPage
