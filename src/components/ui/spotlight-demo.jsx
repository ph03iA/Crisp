import React from 'react';
import { GlowCard } from './spotlight-card';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { 
  RocketOutlined, 
  StarOutlined, 
  CheckCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  BulbOutlined 
} from '@ant-design/icons';

export function SpotlightDemo() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-10 p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-4xl font-bold text-white">Spotlight Card Demo</h2>
        <p className="text-slate-300">Move your mouse around to see the spotlight effect</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8">
        {/* Basic Cards */}
        <GlowCard glowColor="blue" size="md">
          <div className="flex flex-col h-full justify-between text-white">
            <div className="text-center">
              <RocketOutlined className="text-4xl mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-2">AI Interview</h3>
              <p className="text-sm text-slate-300">Advanced AI-powered interview assessment</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-blue-500/20 text-blue-300">Advanced</Badge>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="purple" size="md">
          <div className="flex flex-col h-full justify-between text-white">
            <div className="text-center">
              <StarOutlined className="text-4xl mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2">Premium Features</h3>
              <p className="text-sm text-slate-300">Unlock advanced scoring and analytics</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-purple-500/20 text-purple-300">Premium</Badge>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="green" size="md">
          <div className="flex flex-col h-full justify-between text-white">
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-2">Get Started</h3>
              <p className="text-sm text-slate-300">Begin your interview journey today</p>
            </div>
            <div className="space-y-2">
              <Badge className="bg-green-500/20 text-green-300">Free</Badge>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <GlowCard glowColor="orange" customSize={true} className="w-full h-40">
          <div className="flex items-center space-x-4 text-white h-full">
            <div className="flex-shrink-0">
              <PlayCircleOutlined className="text-3xl text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-2">Interactive Sessions</h4>
              <p className="text-sm text-slate-300">Real-time feedback and scoring during interviews</p>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="red" customSize={true} className="w-full h-40">
          <div className="flex items-center space-x-4 text-white h-full">
            <div className="flex-shrink-0">
              <TrophyOutlined className="text-3xl text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-2">Performance Analytics</h4>
              <p className="text-sm text-slate-300">Detailed insights into your interview performance</p>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Small showcase cards */}
      <div className="flex flex-wrap gap-4">
        <GlowCard glowColor="blue" size="sm">
          <div className="text-center text-white">
            <BulbOutlined className="text-2xl mb-2 text-blue-400" />
            <p className="text-xs font-medium">Quick Tips</p>
          </div>
        </GlowCard>
        
        <GlowCard glowColor="purple" size="sm">
          <div className="text-center text-white">
            <StarOutlined className="text-2xl mb-2 text-purple-400" />
            <p className="text-xs font-medium">Favorites</p>
          </div>
        </GlowCard>
        
        <GlowCard glowColor="green" size="sm">
          <div className="text-center text-white">
            <CheckCircleOutlined className="text-2xl mb-2 text-green-400" />
            <p className="text-xs font-medium">Completed</p>
          </div>
        </GlowCard>
      </div>

      {/* Large showcase card */}
      <GlowCard glowColor="blue" size="lg">
        <div className="flex flex-col h-full justify-between text-white p-2">
          <div className="text-center space-y-4">
            <RocketOutlined className="text-5xl text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Interview Assistant</h2>
              <p className="text-slate-300 mb-4">Experience the future of interview preparation with our AI-powered platform</p>
            </div>
            <div className="flex justify-center space-x-2">
              <Badge className="bg-blue-500/20 text-blue-300">AI Powered</Badge>
              <Badge className="bg-green-500/20 text-green-300">Real-time</Badge>
              <Badge className="bg-purple-500/20 text-purple-300">Analytics</Badge>
            </div>
          </div>
          <div className="text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Demo
            </Button>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

export default SpotlightDemo;
