import React, { useState } from 'react'
import { Badge } from 'antd'
import { UserOutlined, DashboardOutlined, InteractionOutlined } from '@ant-design/icons'
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


  return (
    <nav className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="hidden md:flex h-16 items-center justify-center">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar max-w-full">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant="outline"
                  size="sm"
                  onClick={() => onTabChange(item.key)}
                  className={cn(
                    "flex items-center space-x-2 h-9 px-3 text-white bg-black/90 border-black/90 hover:bg-black hover:border-black shadow-xl rounded-full backdrop-blur-none",
                    activeTab === item.key && "bg-black text-white"
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-transparent px-4 py-2">
        <div className="flex items-center justify-around space-x-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant="outline"
              size="sm"
              onClick={() => onTabChange(item.key)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 h-8 text-white bg-black/90 border-black/90 hover:bg-black hover:border-black shadow-xl rounded-full backdrop-blur-none",
                activeTab === item.key && "bg-black text-white"
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
