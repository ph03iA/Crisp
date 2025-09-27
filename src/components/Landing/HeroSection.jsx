import React from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  GithubOutlined, 
  PlayCircleOutlined, 
  RocketOutlined,
  CheckCircleOutlined,
  StarOutlined 
} from '@ant-design/icons'

const HeroSection = ({ onGetStarted, onViewDemo }) => {
  const companies = [
    { name: 'Google', logo: '🔍' },
    { name: 'Meta', logo: '📘' },
    { name: 'Apple', logo: '🍎' },
    { name: 'Amazon', logo: '📦' },
    { name: 'Microsoft', logo: '🪟' },
    { name: 'Netflix', logo: '🎬' },
    { name: 'Tesla', logo: '⚡' },
    { name: 'Spotify', logo: '🎵' }
  ]

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-blue-200/30" />
      </div>
      
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-blue-200/40 to-transparent transform rotate-45 translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-gradient-to-r from-purple-200/40 to-transparent transform -rotate-45 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <RocketOutlined className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-wide">
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
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight">
                Elevate your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  tech interviews.
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
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
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 text-base"
              >
                <PlayCircleOutlined className="w-4 h-4 mr-2" />
                Try it out
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={onViewDemo}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-base"
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

        {/* Companies Section */}
        <div className="pt-16 border-t border-slate-200/60">
          <p className="text-center text-sm text-slate-500 mb-8 font-medium">
            Interview questions from
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center space-x-2 text-slate-600">
                <span className="text-xl">{company.logo}</span>
                <span className="font-medium text-sm">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
