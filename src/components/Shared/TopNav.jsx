import React from 'react'
import { Badge } from 'antd'
import { UserOutlined, DashboardOutlined, InteractionOutlined } from '@ant-design/icons'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const TopNav = ({ activeTab, onTabChange }) => {
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
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <InteractionOutlined className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI Interview Assistant
                </h1>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant={activeTab === item.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.key)}
                  className={cn(
                    "flex items-center space-x-2 h-9 px-3",
                    activeTab === item.key && "bg-primary text-primary-foreground"
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <div className="text-sm font-medium text-foreground">
                {activeTab === 'interviewee' ? 'Interview Mode' : 'Review Mode'}
              </div>
              <div className="text-xs text-muted-foreground">
                {navItems.find(item => item.key === activeTab)?.description}
              </div>
            </div>
            
            <Badge 
              count={0} 
              className="flex items-center"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <UserOutlined className="h-4 w-4 text-muted-foreground" />
              </div>
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-card px-4 py-2">
        <div className="flex items-center justify-around space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={activeTab === item.key ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(item.key)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 h-8",
                activeTab === item.key && "bg-primary text-primary-foreground"
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
