import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { GlowCard } from '../ui/spotlight-card'
import { HeroSectionWithShader } from '../ui/hero-section-with-smooth-bg-shader'
import { 
  GithubOutlined, 
  PlayCircleOutlined, 
  RocketOutlined,
  CheckCircleOutlined,
  StarOutlined 
} from '@ant-design/icons'

const HeroSection = ({ onGetStarted, onViewDemo }) => {

  const features = [
    {
      title: "Resume Upload & Quick Extraction",
      description: "Easily upload your resume in PDF or DOCX format. The system pulls out important details like your name, email, and phone number so you don't have to fill everything in manually.",
      icon: <RocketOutlined className="w-7 h-7" />
    },
    {
      title: "Interactive Interview Experience", 
      description: "Answer a series of carefully structured questions for a Full Stack role. Each question has a timer to keep things realistic, and your responses are automatically saved.",
      icon: <PlayCircleOutlined className="w-7 h-7" />
    },
    {
      title: "Clear and Organized Dashboard",
      description: "For interviewers, all candidate information is neatly presented in one place from scores and summaries to the full chat history. Reviewing and comparing candidates becomes effortless.",
      icon: <CheckCircleOutlined className="w-7 h-7" />
    },
    {
      title: "Pick Up Where You Left Off",
      description: "If you close or refresh the page, your progress isn't lost. A \"Welcome Back\" prompt helps you continue right where you stopped.",
      icon: <StarOutlined className="w-7 h-7" />
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
      <div className="container mx-auto px-4 pt-20 pb-16 max-w-7xl">

        {/* Hero Content */}
        <div className="flex items-center justify-center min-h-[60vh]">
          {/* Hero Text */}
          <div className="space-y-8 text-center max-w-6xl mx-auto w-full px-4">
            <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight archivo-black-regular flex flex-col text-center items-center">
              <span>Smarter Interviews.</span>
              <span>Fairer Evaluations.</span>
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto text-center">
              Master technical interviews with AI-powered feedback, realistic simulations, 
              and comprehensive performance analytics.
            </p>
            </div>

            {/* Feature Cards with Spotlight Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => {
                const colors = ['blue', 'purple', 'green', 'orange'];
                return (
                  <GlowCard 
                    key={index} 
                    glowColor={colors[index % colors.length]}
                    customSize={true} 
                    className="w-full h-80 bg-white/5 border-white/10 !block"
                  >
                    <div className="absolute inset-0 z-10 p-6 flex flex-col text-white justify-start items-center text-center">
                      <div className="space-y-4 h-full flex flex-col">
                        <h3 className="text-lg font-bold text-gray-700 leading-tight">{feature.title}</h3>
                        <p className="text-white/90 text-sm leading-relaxed font-normal flex-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </GlowCard>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-white text-black hover:bg-white/90 shadow-lg"
              >
                <PlayCircleOutlined className="w-4 h-4 mr-2" />
                Try it out
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={onViewDemo}
                className="border-white/50 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <GithubOutlined className="w-4 h-4 mr-2" />
                Star on GitHub
              </Button>
            </div>
          </div>

        </div>

      </div>
    </HeroSectionWithShader>
  )
}

export default HeroSection
