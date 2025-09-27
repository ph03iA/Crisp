import React, { useState, useEffect, useCallback } from 'react'

const Timer = ({ 
  timeLimit, 
  isActive, 
  onTimeUp, 
  onTick 
}) => {
  const [remainingTime, setRemainingTime] = useState(timeLimit)

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
  }, [timeLimit])

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
    return ((timeLimit - remainingTime) / timeLimit) * 100
  }

  const getColorClass = () => {
    const percentage = (remainingTime / timeLimit) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBarColor = () => {
    const percentage = (remainingTime / timeLimit) * 100
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Circular progress indicator */}
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - getProgressPercentage() / 100)}`}
            className={getProgressBarColor().replace('bg-', 'text-')}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${getColorClass()}`}>
            {formatTime(remainingTime)}
          </span>
        </div>
      </div>

      {/* Linear progress bar for mobile */}
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressBarColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Status text */}
      <p className="text-xs text-gray-500 text-center">
        {remainingTime <= 10 && remainingTime > 0 ? 'Time running out!' : 
         remainingTime === 0 ? 'Time\'s up!' : 
         `${formatTime(remainingTime)} remaining`}
      </p>
    </div>
  )
}

export default Timer
