import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Upload, message, Progress, Alert } from 'antd'
import { FileOutlined, CloudUploadOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { parseResume, validateResumeData } from './parser'
import { generateQuestionSet } from '../../api/questionBank'
import { createSession } from '../../features/sessionsSlice'
import { cn } from '../../lib/utils'

const { Dragger } = Upload

const ResumeUploader = ({ onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
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

    setIsUploading(true)
    setError('')
    setUploadedFile(file)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 200)

    try {
      // Parse the resume
      message.loading({ content: 'Processing your resume...', key: 'upload' })
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

      setUploadProgress(100)
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to process resume'
      setError(errorMessage)
      message.error({ content: errorMessage, key: 'upload' })
      clearInterval(progressInterval)
    } finally {
      setIsUploading(false)
      clearInterval(progressInterval)
    }
  }, [dispatch, onSuccess])

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      handleFileUpload(file)
      return false // Prevent automatic upload
    },
    disabled: isUploading,
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileOutlined className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Upload Your Resume
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started by uploading your resume for AI-powered interview assessment
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CheckCircleOutlined className="h-3 w-3" />
            <span>PDF Support</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CheckCircleOutlined className="h-3 w-3" />
            <span>DOCX Support</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CheckCircleOutlined className="h-3 w-3" />
            <span>Auto-Parse</span>
          </Badge>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <Dragger {...uploadProps} className="border-none bg-transparent">
            <div className="space-y-6">
              {isUploading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <LoadingOutlined className="text-4xl text-primary animate-spin" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      Processing your resume...
                    </p>
                    <Progress
                      percent={Math.round(uploadProgress)}
                      status="active"
                      strokeColor={{
                        from: '#3b82f6',
                        to: '#1d4ed8',
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                  
                  {uploadedFile && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <FileOutlined />
                      <span>{uploadedFile.name}</span>
                      <span>({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <CloudUploadOutlined className="text-5xl text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-foreground">
                      Drop your resume here or{' '}
                      <span className="text-primary">click to browse</span>
                    </p>
                    <p className="text-muted-foreground">
                      Supports PDF and DOCX files up to 10MB
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" size="lg">
                      <FileOutlined className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Dragger>
        </CardContent>
      </Card>

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

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We'll automatically extract your name, email, and phone number from your resume
        </p>
        <p className="text-xs text-muted-foreground">
          Your file is processed locally and securely
        </p>
      </div>
    </div>
  )
}

export default ResumeUploader
