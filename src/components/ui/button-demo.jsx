import React from 'react'
import { Button } from './button'
import { GithubOutlined, LoadingOutlined, HeartOutlined } from '@ant-design/icons'

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-4 p-4">
      {/* Default */}
      <Button>Default</Button>
      
      {/* Secondary */}
      <Button variant="secondary">Secondary</Button>
      
      {/* Destructive */}
      <Button variant="destructive">Destructive</Button>
      
      {/* Outline */}
      <Button variant="outline">Outline</Button>
      
      {/* Ghost */}
      <Button variant="ghost">Ghost</Button>
      
      {/* Link */}
      <Button variant="link">Link</Button>
      
      {/* With Icon */}
      <Button>
        <GithubOutlined className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      
      {/* Icon Only */}
      <Button size="icon">
        <HeartOutlined className="h-4 w-4" />
      </Button>
      
      {/* Loading */}
      <Button disabled>
        <LoadingOutlined className="mr-2 h-4 w-4 animate-spin" />
        Loading
      </Button>
      
      {/* Sizes */}
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      
      {/* AsChild example - Link that looks like a button */}
      <Button asChild>
        <a href="https://github.com/ph03iA/Crisp" target="_blank" rel="noopener noreferrer">
          Visit GitHub
        </a>
      </Button>
    </div>
  )
}
