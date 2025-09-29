import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { message, Alert } from 'antd'
import { FileOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Badge } from '../ui/badge'
import { FileUploadProgressBar } from '../application/file-upload/file-upload-progress-bar'
import { parseResume, validateResumeData } from './parser'
import { generateQuestionSet } from '../../api/questionBank'
import { createSession } from '../../features/sessionsSlice'

const ResumeUploader = ({ onSuccess }) => {
  const [error, setError] = useState('')
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
      message.error('Please upload a PDF or DOCX file only.')
      return false
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      message.error('File size must be less than 10MB.')
      return false
    }

    setError('')

    try {
      // Parse the resume
      message.loading({ content: 'Processing your resume...', key: 'upload' })
      console.log('Starting resume parsing for file:', file.name, 'Type:', file.type, 'Size:', file.size)
      const resumeData = await parseResume(file)
      console.log('Resume data extracted:', resumeData)
      const validation = validateResumeData(resumeData)
      console.log('Validation result:', validation)

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

      message.success({ content: 'Resume processed successfully!', key: 'upload' })

      // Extract session ID (using a more reliable method)
      const sessionId = sessionAction.payload.questions[0]?.id ? 
        sessionAction.payload.questions[0].id.split('-')[0] : 
        Date.now().toString()

      // Small delay to show completion
      setTimeout(() => {
        onSuccess(sessionId, validation.missing)
      }, 800)

    } catch (err) {
      console.error('Resume parsing error:', err)
      let errorMessage = err instanceof Error ? err.message : 'Failed to process resume'
      
      // Provide more helpful error messages
      if (errorMessage.includes('network issues')) {
        errorMessage = 'PDF parsing failed due to network issues. Please check your internet connection and try again.'
      } else if (errorMessage.includes('not a valid PDF')) {
        errorMessage = 'The uploaded file is not a valid PDF or is corrupted. Please try a different file.'
      } else if (errorMessage.includes('image-based')) {
        errorMessage = 'This PDF appears to be image-based and cannot extract text. Please try a text-based PDF or DOCX file.'
      } else if (errorMessage.includes('All PDF parsing methods failed')) {
        errorMessage = 'Unable to process this PDF file. Please try converting it to DOCX format or use a different file.'
      }
      
      setError(errorMessage)
      message.error({ content: errorMessage, key: 'upload' })
    }
  }, [dispatch, onSuccess])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 p-4 rounded-lg text-sm">
          <strong>Debug Mode:</strong> Check browser console for detailed PDF parsing logs
        </div>
      )}
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xl font-bold text-white leading-tight drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
              Upload Your Resume
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 text-sm">
          <Badge variant="secondary" className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm border-white/20 text-white font-bold drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            <CheckCircleOutlined className="h-3 w-3" />
            <span>PDF Support</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm border-white/20 text-white font-bold drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            <CheckCircleOutlined className="h-3 w-3" />
            <span>DOCX Support</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm border-white/20 text-white font-bold drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            <CheckCircleOutlined className="h-3 w-3" />
            <span>Auto-Parse</span>
          </Badge>
        </div>
      </div>

      {/* File Upload Component */}
      <FileUploadProgressBar 
        isDisabled={false}
        onFileUpload={handleFileUpload}
      />

      {/* Error Display */}
      {error && (
        <Alert
          message="Upload Error"
          description={error}
          type="error"
          showIcon
          className="rounded-lg"
        />
      )}

    </div>
  )
}

export default ResumeUploader
