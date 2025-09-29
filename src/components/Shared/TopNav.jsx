import React, { useState } from 'react'
import { Badge } from 'antd'
import { UserOutlined, DashboardOutlined, InteractionOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const TopNav = ({ activeTab, onTabChange }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const navItems = [
    {
      key: 'interviewee',
      label: 'Take Interview',
      icon: <UserOutlined className="w-4 h-4" />,
      description: 'Start your interview session'
    },
    {
      key: 'interviewer',
      label: 'Dashboard',
      icon: <DashboardOutlined className="w-4 h-4" />,
      description: 'View candidate results'
    }
  ]

  const handleBackToHome = () => {
    setIsTransitioning(true)
    // Add a small delay for smooth transition
    setTimeout(() => {
      onTabChange('home')
      setIsTransitioning(false)
    }, 200)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Back Button */}
          <div className="flex items-center">
            <button
              onClick={handleBackToHome}
              disabled={isTransitioning}
              className={cn(
                "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 ease-in-out",
                isTransitioning && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeftOutlined className={cn("w-4 h-4", isTransitioning && "animate-pulse")} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(item.key)}
                  className={cn(
                    "flex items-center space-x-2 h-9 px-3 text-white",
                    activeTab === item.key && "bg-white/20 text-white"
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-transparent px-4 py-2">
        <div className="flex items-center justify-around space-x-2">
          <button
            onClick={handleBackToHome}
            disabled={isTransitioning}
            className={cn(
              "w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 ease-in-out",
              isTransitioning && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowLeftOutlined className={cn("w-3 h-3", isTransitioning && "animate-pulse")} />
          </button>
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.key)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 h-8 text-white",
                activeTab === item.key && "bg-white/20 text-white"
              )}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default TopNav
