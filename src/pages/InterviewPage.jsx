import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from '../components/ui/button'
import { setActiveTab } from '../features/uiSlice'
import TopNav from '../components/Shared/TopNav'
import WelcomeBackModal from '../components/Shared/WelcomeBackModal'
import IntervieweeTab from '../components/IntervieweeChat/IntervieweeTab'
import InterviewerTab from '../components/InterviewerDashboard/InterviewerTab'
import { ConsistentBackground } from '../components/ui/consistent-background'

const InterviewPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { activeTab, showWelcomeBack } = useSelector(state => state.ui)

  return (
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

      <div className="min-h-screen">
        <TopNav 
          activeTab={activeTab} 
          onTabChange={(tab) => dispatch(setActiveTab(tab))} 
        />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
        </main>

        {showWelcomeBack && <WelcomeBackModal />}
      </div>
    </ConsistentBackground>
  )
}

export default InterviewPage
