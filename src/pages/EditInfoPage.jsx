import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { App, Alert } from 'antd'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { ConsistentBackground } from '../components/ui/consistent-background'
import { createSession } from '../features/sessionsSlice'
import { setActiveTab } from '../features/uiSlice'
import { startInterview } from '../api/backend'

const EditInfoPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { message } = App.useApp()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [resumeText, setResumeText] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')

  useEffect(() => {
    // Get data from location state (passed from upload page)
    if (location.state?.extractedData) {
      const { name, email, phone, text, fileName } = location.state.extractedData
      setFormData({ name: name || '', email: email || '', phone: phone || '' })
      setOriginalData({ name: name || '', email: email || '', phone: phone || '' })
      setResumeText(text || '')
      setResumeFileName(fileName || '')
    } else {
      // If no data, redirect back to upload
      navigate('/upload')
    }
  }, [location.state, navigate])

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return value.trim().length >= 2
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case 'phone':
        return /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))
      default:
        return true
    }
  }

  const getFieldStatus = (field) => {
    const value = formData[field]
    const original = originalData[field]
    const isValid = validateField(field, value)
    
    if (!original && !value) return 'missing'
    if (!original && value) return 'added'
    if (original && !value) return 'removed'
    if (original && value && original !== value) return 'edited'
    if (isValid) return 'valid'
    return 'invalid'
  }

  const getFieldColor = (field) => {
    const status = getFieldStatus(field)
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800'
      case 'added': return 'bg-blue-100 text-blue-800'
      case 'edited': return 'bg-yellow-100 text-yellow-800'
      case 'invalid': return 'bg-red-100 text-red-800'
      case 'missing': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFieldLabel = (field) => {
    const status = getFieldStatus(field)
    switch (status) {
      case 'valid': return 'Valid'
      case 'added': return 'Added'
      case 'edited': return 'Edited'
      case 'invalid': return 'Invalid'
      case 'missing': return 'Missing'
      default: return 'Unknown'
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (!validateField('name', formData.name)) {
      newErrors.name = 'Please enter a valid name (at least 2 characters)'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateField('email', formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validateField('phone', formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartInterview = async () => {
    if (!validateForm()) {
      message.error('Please fix the errors before proceeding')
      return
    }

    setIsProcessing(true)
    
    try {
      // Step 1: Generate interview questions
      message.loading({ content: 'Generating personalized interview questions...', key: 'interview' })
      const start = await startInterview({ 
        name: formData.name, 
        email: formData.email, 
        resumeText: resumeText 
      })
      const questions = start.questions
      const sessionId = start.sessionId

      // Step 2: Create session
      message.loading({ content: 'Setting up your interview session...', key: 'interview' })
      const sessionAction = createSession({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resumeFileName: resumeFileName,
        questions,
        serverSessionId: sessionId
      })

      dispatch(sessionAction)

      // Step 3: Navigate to interview
      message.success({ content: 'Interview ready!', key: 'interview' })
      dispatch(setActiveTab('interviewee'))
      navigate('/interview')

    } catch (err) {
      console.error('Failed to start interview:', err)
      message.error('Failed to start interview. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const hasChanges = () => {
    return Object.keys(formData).some(key => formData[key] !== originalData[key])
  }

  const hasRequiredFields = () => {
    return formData.name.trim() && formData.email.trim() && formData.phone.trim()
  }

  return (
    <App>
      <ConsistentBackground>
        {/* Back Button - Fixed position top left */}
        <div className="fixed top-4 left-4 z-[9999]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/upload')}
            className="bg-black/90 border-black/90 text-white hover:bg-black hover:border-black shadow-xl rounded-full backdrop-blur-none"
          >
            <ArrowLeftOutlined className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>

        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Review Your Information
                </h1>
                <p className="text-white/80">
                  Please review and confirm the details extracted from your resume
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">
                      Full Name *
                    </label>
                    <Badge className={getFieldColor('name')}>
                      {getFieldLabel('name')}
                    </Badge>
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`bg-white/10 border-white/30 text-white placeholder-white/70 focus:border-white/50 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">
                      Email Address *
                    </label>
                    <Badge className={getFieldColor('email')}>
                      {getFieldLabel('email')}
                    </Badge>
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`bg-white/10 border-white/30 text-white placeholder-white/70 focus:border-white/50 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">
                      Phone Number *
                    </label>
                    <Badge className={getFieldColor('phone')}>
                      {getFieldLabel('phone')}
                    </Badge>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`bg-white/10 border-white/30 text-white placeholder-white/70 focus:border-white/50 ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                    disabled={isProcessing}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-sm font-medium text-white mb-2">Summary</h3>
                <div className="space-y-1 text-xs text-white/80">
                  <p>• All fields marked with * are required</p>
                  <p>• Green badges indicate valid information</p>
                  <p>• Yellow badges indicate edited information</p>
                  <p>• Blue badges indicate newly added information</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/upload')}
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                  disabled={isProcessing}
                >
                  Back to Upload
                </Button>
                <Button
                  onClick={handleStartInterview}
                  disabled={!hasRequiredFields() || isProcessing}
                  className={`flex-1 bg-white text-black hover:bg-white/90 ${
                    !hasRequiredFields() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Starting Interview...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircleOutlined className="w-4 h-4 mr-2" />
                      Start Interview
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ConsistentBackground>
    </App>
  )
}

export default EditInfoPage
