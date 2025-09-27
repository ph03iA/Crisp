import React, { useState } from 'react'

const InfoCollector = ({ missingFields, currentInfo, onComplete }) => {
  const [formData, setFormData] = useState({
    name: currentInfo.name || '',
    email: currentInfo.email || '',
    phone: currentInfo.phone || ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (missingFields.includes('name') && !formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (missingFields.includes('email') && !formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (missingFields.includes('phone') && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onComplete(formData)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Complete Your Information
        </h2>
        <p className="text-gray-600">
          We need a few more details to proceed with your interview
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {missingFields.includes('name') && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange('name')}
              className={`input-field ${errors.name ? 'border-red-300' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        )}

        {missingFields.includes('email') && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange('email')}
              className={`input-field ${errors.email ? 'border-red-300' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        )}

        {missingFields.includes('phone') && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full btn-primary"
        >
          Start Interview
        </button>
      </form>
    </div>
  )
}

export default InfoCollector
