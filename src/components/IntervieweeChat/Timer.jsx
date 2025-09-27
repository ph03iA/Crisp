import React, { useState, useEffect, useCallback } from 'react'
import { Progress, Statistic } from 'antd'
import { ClockCircleOutlined, AlertOutlined } from '@ant-design/icons'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

const { Countdown } = Statistic

const Timer = ({ 
  timeLimit, 
  isActive, 
  onTimeUp, 
  onTick 
}) => {
  const [remainingTime, setRemainingTime] = useState(timeLimit)
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  const tick = useCallback(() => {
    setRemainingTime(prev => {
      const newTime = prev - 1
      onTick?.(newTime)
      
      if (newTime <= 0) {
        onTimeUp()
        return 0
      }
      return newTime
    })
  }, [onTimeUp, onTick])

  useEffect(() => {
    setRemainingTime(timeLimit)
    setIsWarning(false)
    setIsCritical(false)
  }, [timeLimit])

  useEffect(() => {
    const percentage = (remainingTime / timeLimit) * 100
    setIsWarning(percentage <= 25 && percentage > 10)
    setIsCritical(percentage <= 10)
  }, [remainingTime, timeLimit])

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isActive, tick])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return Math.max(0, ((timeLimit - remainingTime) / timeLimit) * 100)
  }

  const getProgressColor = () => {
    const percentage = (remainingTime / timeLimit) * 100
    if (percentage <= 10) return '#ef4444' // red
    if (percentage <= 25) return '#f59e0b' // yellow
    return '#10b981' // green
  }

  const getStatusVariant = () => {
    if (isCritical) return 'destructive'
    if (isWarning) return 'warning'
    return 'success'
  }

  const getStatusText = () => {
    if (remainingTime <= 0) return 'Time\'s up!'
    if (isCritical) return 'Time running out!'
    if (isWarning) return 'Warning: Low time'
    return 'Time remaining'
  }

  return (
    <Card className={cn(
      "transition-all duration-300",
      isCritical && "border-destructive/50 shadow-lg shadow-destructive/20",
      isWarning && "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
    )}>
      <CardContent className="p-6 space-y-6">
        {/* Main Timer Display */}
        <div className="text-center space-y-4">
          <div className="relative">
            {/* Circular Progress */}
            <div className="relative w-24 h-24 mx-auto">
              <Progress
                type="circle"
                percent={100 - getProgressPercentage()}
                strokeColor={getProgressColor()}
                trailColor="hsl(var(--muted))"
                size={96}
                strokeWidth={8}
                format={() => (
                  <div className="text-center">
                    <div className={cn(
                      "text-xl font-bold tabular-nums",
                      isCritical && "text-destructive animate-pulse",
                      isWarning && "text-yellow-600",
                      !isWarning && !isCritical && "text-foreground"
                    )}>
                      {formatTime(remainingTime)}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Warning Icon */}
            {(isWarning || isCritical) && (
              <div className="absolute -top-2 -right-2">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  isCritical ? "bg-destructive text-destructive-foreground animate-pulse" : 
                  "bg-yellow-500 text-yellow-50"
                )}>
                  <AlertOutlined className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <Badge variant={getStatusVariant()} className="px-3 py-1">
            <ClockCircleOutlined className="w-3 h-3 mr-1" />
            {getStatusText()}
          </Badge>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(getProgressPercentage())}% elapsed</span>
          </div>
          <Progress
            percent={getProgressPercentage()}
            strokeColor={getProgressColor()}
            trailColor="hsl(var(--muted))"
            size="small"
            showInfo={false}
          />
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className={cn(
              "text-sm font-medium tabular-nums",
              isCritical && "text-destructive",
              isWarning && "text-yellow-600"
            )}>
              {formatTime(remainingTime)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-medium text-muted-foreground tabular-nums">
              {formatTime(timeLimit)}
            </p>
          </div>
        </div>

        {/* Auto-submit warning */}
        {isCritical && remainingTime > 0 && (
          <div className="text-center p-2 bg-destructive/10 rounded-md">
            <p className="text-xs text-destructive font-medium">
              Auto-submit when time expires
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Timer
