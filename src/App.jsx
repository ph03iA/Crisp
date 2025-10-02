import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme, App as AntdApp, Modal } from 'antd'
import { setActiveTab, setShowWelcomeBack } from './features/uiSlice'
import { resumeSession } from './features/sessionsSlice'
import { broadcastManager } from './utils/broadcast'
import { ThemeProvider } from './components/theme-provider'
import { readJson } from './utils/clientStorage'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import EditInfoPage from './pages/EditInfoPage'
import InterviewPage from './pages/InterviewPage'
import { store, persistor } from './app/store'

const AppContent = () => {
  const dispatch = useDispatch()
  const { activeTab, showWelcomeBack } = useSelector(state => state.ui)
  const { sessions, currentSessionId } = useSelector(state => state.sessions)
  const [welcomeBackModal, setWelcomeBackModal] = useState(false)

  // Check for unfinished sessions on app load
  useEffect(() => {
    const db = readJson();
    const unfinished = Object.values(db.sessions).some(s => s.answers?.length < 6);
    
    if (unfinished) {
      setWelcomeBackModal(true);
    }
  }, []);

  // Handle welcome back modal actions
  const handleWelcomeBackOk = () => {
    setWelcomeBackModal(false);
    // Navigate to interview page or resume session
    // You can add navigation logic here if needed
  };

  const handleWelcomeBackCancel = () => {
    setWelcomeBackModal(false);
    // Clear localStorage to start fresh
    localStorage.removeItem('crisp-db');
  };

  // Track if this is a page reload (keeping existing logic for Redux)
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
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/edit-info" element={<EditInfoPage />} />
          <Route path="/interview" element={<InterviewPage />} />
        </Routes>
        
        {/* Welcome Back Modal */}
        <Modal
          title="Welcome Back!"
          open={welcomeBackModal}
          onOk={handleWelcomeBackOk}
          onCancel={handleWelcomeBackCancel}
          okText="Resume Interview"
          cancelText="Start Fresh"
          centered
        >
          <p>You have an unfinished interview. Would you like to resume where you left off?</p>
        </Modal>
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
