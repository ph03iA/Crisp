import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
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
      title: "AI-Powered Assessment",
      description: "Get detailed feedback on your interview performance with our advanced scoring algorithm.",
      icon: <RocketOutlined className="w-5 h-5" />
    },
    {
      title: "Real Interview Experience", 
      description: "Practice with timed questions that simulate actual technical interviews.",
      icon: <PlayCircleOutlined className="w-5 h-5" />
    }
  ]

  return (
    <HeroSectionWithShader
      colors={["#3b82f6", "#1d4ed8", "#6366f1", "#8b5cf6", "#a855f7", "#c084fc"]}
      distortion={1.2}
      swirl={0.8}
      speed={0.5}
      offsetX={0.1}
      veilOpacity="bg-black/20"
    >
      <div className="container mx-auto px-4 pt-20 pb-16 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <RocketOutlined className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              AI INTERVIEW ASSISTANT
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <StarOutlined className="w-3 h-3 mr-1" />
              Free & Open Source
            </Badge>
          </div>
        </div>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          {/* Left Column - Hero Text */}
          <div className="space-y-8">
            <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Elevate your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                tech interviews.
              </span>
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
              Master technical interviews with AI-powered feedback, realistic simulations, 
              and comprehensive performance analytics.
            </p>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-4 max-w-2xl">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
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

          {/* Right Column - Visual Element */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main Card */}
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm transform rotate-2 hover:rotate-1 transition-transform duration-500">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="success" className="px-3 py-1">
                        <CheckCircleOutlined className="w-3 h-3 mr-1" />
                        Interview Complete
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">87%</div>
                        <div className="text-xs text-muted-foreground">Overall Score</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Technical Knowledge</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold">9/10</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Communication</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold">8/10</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Problem Solving</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div className="w-4/5 h-full bg-yellow-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold">8/10</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        "Excellent technical foundation with clear communication. 
                        Focus on optimizing algorithmic solutions for better performance."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center transform -rotate-12">
                <CheckCircleOutlined className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="absolute -bottom-6 -left-6 w-20 h-12 bg-blue-100 rounded-lg flex items-center justify-center transform rotate-12">
                <span className="text-blue-600 font-bold text-sm">AI Powered</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </HeroSectionWithShader>
  )
}

export default HeroSection
