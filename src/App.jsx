import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ConfigProvider, theme } from 'antd'
import { setActiveTab, setShowWelcomeBack } from './features/uiSlice'
import { broadcastManager } from './utils/broadcast'
import TopNav from './components/Shared/TopNav'
import WelcomeBackModal from './components/Shared/WelcomeBackModal'
import LandingPage from './components/Landing/LandingPage'
import IntervieweeTab from './components/IntervieweeChat/IntervieweeTab'
import InterviewerTab from './components/InterviewerDashboard/InterviewerTab'

const App = () => {
  const dispatch = useDispatch()
  const { activeTab, showWelcomeBack } = useSelector(state => state.ui)
  const { sessions } = useSelector(state => state.sessions)

  // Check for unfinished sessions on app load
  useEffect(() => {
    const unfinishedSessions = Object.values(sessions).filter(
      session => session.status === 'in-progress' && session.currentQuestionIndex < session.questions.length
    )
    
    if (unfinishedSessions.length > 0) {
      dispatch(setShowWelcomeBack(true))
    }
  }, [sessions, dispatch])

  // Set up cross-tab synchronization
  useEffect(() => {
    const unsubscribe = broadcastManager.subscribe((message) => {
      // Handle broadcast messages here if needed
      console.log('Received broadcast:', message)
    })

    return unsubscribe
  }, [])

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        components: {
          Button: {
            borderRadius: 8,
          },
          Input: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: 12,
          },
        },
      }}
    >
      <div className="min-h-screen bg-background">
        {activeTab !== 'home' && (
          <TopNav 
            activeTab={activeTab} 
            onTabChange={(tab) => dispatch(setActiveTab(tab))} 
          />
        )}

        <main className={activeTab === 'home' ? '' : 'container mx-auto px-4 py-8 max-w-7xl'}>
          {activeTab === 'home' ? <LandingPage /> :
           activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
        </main>

        {showWelcomeBack && <WelcomeBackModal />}
      </div>
    </ConfigProvider>
  )
}

export default App
