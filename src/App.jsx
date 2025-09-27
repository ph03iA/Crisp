import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveTab, setShowWelcomeBack } from './features/uiSlice'
import { broadcastManager } from './utils/broadcast'
import TopNav from './components/Shared/TopNav'
import WelcomeBackModal from './components/Shared/WelcomeBackModal'
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
    <div className="min-h-screen bg-gray-50">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => dispatch(setActiveTab(tab))} 
      />

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
      </main>

      {showWelcomeBack && <WelcomeBackModal />}
    </div>
  )
}

export default App
