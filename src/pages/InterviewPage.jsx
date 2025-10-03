import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from '../components/ui/button'
import { setActiveTab } from '../features/uiSlice'
import { discardUnfinishedSessions } from '../features/sessionsSlice'
import { persistor } from '../app/store'
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
      <div className="min-h-screen">
        {/* Header actions above nav bar */}
        <div className="container mx-auto px-4 pt-4 max-w-7xl">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/landing')}
              className="bg-black/90 border-black/90 text-white hover:bg-black hover:border-black shadow-xl rounded-full backdrop-blur-none min-w-[160px] justify-center"
            >
              <ArrowLeftOutlined className="w-4 h-4 mr-2" />
              Back to Landing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  dispatch(discardUnfinishedSessions())
                  await persistor.purge()
                } catch (e) {
                  console.warn('Failed to purge persisted state:', e)
                }
              }}
              className="bg-black/90 border-black/90 text-white hover:bg-black hover:border-black shadow-xl rounded-full backdrop-blur-none min-w-[160px] justify-center"
            >
              Start Fresh
            </Button>
          </div>
        </div>
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
