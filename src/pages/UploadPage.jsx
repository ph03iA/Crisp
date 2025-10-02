import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { App } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from '../components/ui/button'
import { ConsistentBackground } from '../components/ui/consistent-background'
import ResumeUploader from '../components/ResumeUploader'
import { createSession } from '../features/sessionsSlice'
import { setActiveTab } from '../features/uiSlice'

const UploadPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // No longer needed since ResumeUploader handles navigation directly

  return (
    <App>
      <ConsistentBackground>
        {/* Back Button - Fixed position top left */}
        <div className="fixed top-4 left-4 z-[9999]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/landing')}
            className="bg-black/90 border-black/90 text-white hover:bg-black hover:border-black shadow-xl rounded-full backdrop-blur-none"
          >
            <ArrowLeftOutlined className="w-4 h-4 mr-2" />
            Back to Landing
          </Button>
        </div>

        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full px-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-auto">
              <ResumeUploader />
            </div>
          </div>
        </div>
      </ConsistentBackground>
    </App>
  )
}

export default UploadPage
