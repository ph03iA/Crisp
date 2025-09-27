import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { parseResume, validateResumeData } from './parser'
import { generateQuestionSet } from '../../api/questionBank'
import { createSession } from '../../features/sessionsSlice'

const ResumeUploader = ({ onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const dispatch = useDispatch()

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file only.')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Parse the resume
      const resumeData = await parseResume(file)
      const validation = validateResumeData(resumeData)

      // Generate questions for the session
      const questions = generateQuestionSet()

      // Create new session
      const sessionAction = createSession({
        name: resumeData.name,
        email: resumeData.email,
        phone: resumeData.phone,
        resumeFileName: file.name,
        questions
      })

      dispatch(sessionAction)

      // Extract session ID from the action
      const sessionId = sessionAction.payload.questions[0]?.id ? 
        sessionAction.payload.questions[0].id.split('-')[0] : 
        Date.now().toString()

      // Call success callback with missing fields
      onSuccess(sessionId, validation.missing)

    } catch (err) {
      console.error('Resume parsing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process resume')
    } finally {
      setIsUploading(false)
    }
  }, [dispatch, onSuccess])

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600">
          Upload your resume to get started with the interview
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600">Processing your resume...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
                >
                  Click to upload
                </label>{' '}
                or drag and drop
              </p>
              <p className="text-sm text-gray-500">PDF or DOCX up to 10MB</p>
            </div>
          </>
        )}

        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

export default ResumeUploader
