import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { App, Alert } from 'antd'
import { FileOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Badge } from '../ui/badge'
import { FileUploadProgressBar } from '../application/file-upload/file-upload-progress-bar'
import { uploadResume } from '../../api/backend'

const ResumeUploader = () => {
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { message } = App.useApp()

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
    setIsProcessing(true)

    try {
      // Step 1: Upload file
      setProcessingStep('Uploading resume to server...')
      message.loading({ content: 'Uploading resume to server...', key: 'upload' })
      const uploadRes = await uploadResume(file)
      
      // Step 2: Parse resume data
      setProcessingStep('Extracting information from resume...')
      message.loading({ content: 'Extracting information from resume...', key: 'upload' })
      const resumeData = { name: uploadRes.fields.name, email: uploadRes.fields.email, phone: uploadRes.fields.phone }

      // Step 3: Complete upload
      setProcessingStep('Processing complete...')
      message.success({ content: 'Resume processed successfully!', key: 'upload' })

      // Small delay to show completion
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        
        // Navigate to edit info page with extracted data
        navigate('/edit-info', {
          state: {
            extractedData: {
              name: resumeData.name,
              email: resumeData.email,
              phone: resumeData.phone,
              text: uploadRes.text,
              fileName: file.name
            }
          }
        })
      }, 800)

    } catch (err) {
      console.error('Resume parsing error:', err)
      setIsProcessing(false)
      setProcessingStep('')
      
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
  }, [dispatch, navigate])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
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
        isDisabled={isProcessing}
        onFileUpload={handleFileUpload}
      />

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="w-full max-w-md bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                Processing Resume
              </h3>
              <p className="text-white/80 text-sm">
                {processingStep}
              </p>
            </div>
          </div>
          
        </div>
      )}

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
