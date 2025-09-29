import React from 'react'
import { Button } from '../ui/button'
import { GlowCard } from '../ui/spotlight-card'
import { HeroSectionWithShader } from '../ui/hero-section-with-smooth-bg-shader'
import { MorphingText } from '../ui/morphing-text'
import {
  GithubOutlined
} from '@ant-design/icons'

const HeroSection = ({ onGetStarted, onViewDemo, isTransitioning = false }) => {

  const introTexts = [
    "introducing",
    "Crisp!"
  ]

  const features = [
    {
      title: "Resume Upload",
      description: "Upload your resume in PDF and get your details auto filled.",
    },
    {
      title: "Timed Q&A",
      description: "Answer structured questions with realistic timers.",
    },
    {
      title: "Interviewer Dashboard",
      description: "View scores, summaries, and chat history in one place.",
    },
    {
      title: "Progress Sync",
      description: "Pick up right where you left off with the “Welcome Back” feature.",
    }
  ]

  return (
    <HeroSectionWithShader
      colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
      distortion={1.2}
      swirl={0.8}
      speed={0.5}
      offsetX={0.1}
      veilOpacity="bg-black/20"
    >
      <div className="container mx-auto pl-4 lg:pl-0 pr-0 py-4 max-w-full h-screen flex items-center justify-center">

        {/* Hero Content - Two Column Layout */}
        <div className="grid lg:grid-cols-[1fr,2fr] gap-64 items-center w-full">

          {/* Left Column - Main Content */}
          <div className="space-y-10 text-left -ml-12 lg:-ml-20">
            <div className="space-y-8">

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight archivo-black-regular flex flex-col items-start max-w-xl">
                <div className="flex flex-wrap items-center gap-2 mb-2.2">
                  <span className="text-lg font-bold text-white leading-tight drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                    *introducing, Crisp!
                  </span>
                  <MorphingText
                    texts={["͙͘͡★"]}
                    className="!h-10 !text-2xl !font-bold !text-yellow-300 !leading-tight !max-w-xl !mx-0 !text-left !relative !w-auto drop-shadow-xl [text-shadow:_0_4px_8px_rgb(0_0_0_/_60%)] animate-pulse"
                  />
                </div>
                <span>Smarter</span>
                <span>Interviews,</span>
                <span style={{ color: '#2d5085' }}>Fairer Evaluations.</span>
              </h1>

              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-xl">
                Master technical interviews with AI-powered feedback, realistic simulations,
                and comprehensive performance analytics.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={onViewDemo}
                className="bg-black/80 border-black/80 text-white hover:bg-black hover:border-black shadow-lg rounded-full"
              >
                <GithubOutlined className="w-4 h-4 mr-2" />
                Star on GitHub
              </Button>

              <Button
                size="lg"
                onClick={onGetStarted}
                disabled={isTransitioning}
                className={`bg-white text-black hover:bg-white/90 shadow-lg rounded-full transition-all duration-300 ${
                  isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isTransitioning ? 'Loading...' : 'Try it out'}
                <svg className={`w-4 h-4 ml-2 ${isTransitioning ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
          </div>


        </div>

      </div>
    </HeroSectionWithShader>
  )
}

export default HeroSection
