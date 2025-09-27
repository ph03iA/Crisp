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
      colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
      distortion={1.2}
      swirl={0.8}
      speed={0.5}
      offsetX={0.1}
      veilOpacity="bg-black/20"
    >
      <div className="container mx-auto px-4 pt-20 pb-16 max-w-7xl">

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          {/* Left Column - Hero Text */}
          <div className="space-y-8">
            <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight archivo-black-regular">
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

            {/* Feature Cards with Spotlight Effect */}
            <div className="grid gap-6 max-w-2xl">
              {features.map((feature, index) => (
                <GlowCard 
                  key={index} 
                  glowColor={index === 0 ? 'blue' : 'purple'}
                  customSize={true} 
                  className="w-full h-32 bg-white/5 border-white/10"
                >
                  <div className="flex items-center space-x-4 text-white h-full">
                    <div className="flex-shrink-0 text-white bg-primary/80 rounded-full p-3">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </GlowCard>
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
