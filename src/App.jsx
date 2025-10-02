import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ConfigProvider, theme, App as AntdApp } from 'antd'
import { setActiveTab, setShowWelcomeBack } from './features/uiSlice'
import { resumeSession } from './features/sessionsSlice'
import { broadcastManager } from './utils/broadcast'
import { ThemeProvider } from './components/theme-provider'
import TopNav from './components/Shared/TopNav'
import WelcomeBackModal from './components/Shared/WelcomeBackModal'
import LandingPage from './components/Landing/LandingPage'
import IntervieweeTab from './components/IntervieweeChat/IntervieweeTab'
import InterviewerTab from './components/InterviewerDashboard/InterviewerTab'
import { ConsistentBackground } from './components/ui/consistent-background'
import { store, persistor } from './app/store'

const AppContent = () => {
  const dispatch = useDispatch()
  const { activeTab, showWelcomeBack } = useSelector(state => state.ui)
  const { sessions, currentSessionId } = useSelector(state => state.sessions)

  // Track if this is a page reload
  useEffect(() => {
    // Check if this is a page reload by looking for a session storage flag
    const isPageReload = !sessionStorage.getItem('app-initialized')
    if (isPageReload) {
      sessionStorage.setItem('app-initialized', 'true')
    }

    // Only show welcome back modal on page reload, not on every state change
    if (!isPageReload) return

    const unfinishedSessions = Object.values(sessions).filter(
      session => session.status === 'in-progress' && session.currentQuestionIndex < session.questions.length
    )

    if (unfinishedSessions.length === 0) return

    // Show welcome back modal only on page reload
    dispatch(setShowWelcomeBack(true))
  }, []) // Empty dependency array - only run on mount/reload

  // Set up cross-tab synchronization
  useEffect(() => {
    const unsubscribe = broadcastManager.subscribe((message) => {
      // Handle broadcast messages here if needed
      console.log('Received broadcast:', message)
    })

    return unsubscribe
  }, [])

  // Cleanup session storage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('app-initialized')
    }
  }, [])

  const content = (
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
      <AntdApp>
        {activeTab === 'home' ? (
          <LandingPage />
        ) : (
          <ConsistentBackground>
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
        )}
      </AntdApp>
    </ConfigProvider>
  )

  return content
}

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </ThemeProvider>
  )
}

export default App
