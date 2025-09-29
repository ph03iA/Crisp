import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const MissingFieldsCollector = ({ missingFields, currentInfo, onComplete }) => {
  const [formData, setFormData] = useState({
    name: currentInfo.name || '',
    email: currentInfo.email || '',
    phone: currentInfo.phone || ''
  })
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [isValidating, setIsValidating] = useState(false)

  const fieldConfig = {
    name: {
      label: 'Full Name',
      placeholder: 'Enter your full name',
      type: 'text',
      validation: (value) => value.trim().length >= 2,
      errorMessage: 'Please enter a valid name (at least 2 characters)'
    },
    email: {
      label: 'Email Address',
      placeholder: 'Enter your email address',
      type: 'email',
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      errorMessage: 'Please enter a valid email address'
    },
    phone: {
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      type: 'tel',
      validation: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, '')),
      errorMessage: 'Please enter a valid phone number'
    }
  }

  const currentField = missingFields[currentFieldIndex]
  const currentConfig = fieldConfig[currentField]
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [currentField]: value }))
    setError('')
  }

  const handleNext = async () => {
    const value = formData[currentField]
    setIsValidating(true)
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (currentConfig.validation(value)) {
      setError('')
      if (currentFieldIndex < missingFields.length - 1) {
        setCurrentFieldIndex(prev => prev + 1)
      } else {
        // All fields completed
        onComplete(formData)
      }
    } else {
      setError(currentConfig.errorMessage)
    }
    
    setIsValidating(false)
  }

  const handleSkip = () => {
    if (currentFieldIndex < missingFields.length - 1) {
      setCurrentFieldIndex(prev => prev + 1)
    } else {
      onComplete(formData)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-lg font-bold text-white leading-tight drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                Missing Information
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-white/90 text-sm">
              We need a few more details to get started with your interview
            </p>
            <div className="mt-2 text-xs text-white/70">
              {currentFieldIndex + 1} of {missingFields.length}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {currentConfig.label}
              </label>
              <Input
                type={currentConfig.type}
                placeholder={currentConfig.placeholder}
                value={formData[currentField]}
                onChange={handleInputChange}
                className="bg-white/10 border-white/30 text-white placeholder-white/70 focus:border-white/50"
                disabled={isValidating}
              />
              {error && (
                <p className="text-red-400 text-xs mt-1">{error}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleNext}
              disabled={isValidating || !formData[currentField].trim()}
              className="flex-1 bg-white text-black hover:bg-white/90"
            >
              {isValidating ? 'Validating...' : 
               currentFieldIndex < missingFields.length - 1 ? 'Next' : 'Complete'}
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MissingFieldsCollector
