import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme, App as AntdApp } from 'antd'
import { setShowWelcomeBack } from './features/uiSlice'
import { broadcastManager } from './utils/broadcast'
import { ThemeProvider } from './components/theme-provider'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import EditInfoPage from './pages/EditInfoPage'
import InterviewPage from './pages/InterviewPage'
import { persistor } from './app/store'

const AppContent = () => {
  const dispatch = useDispatch()
  const { sessions } = useSelector(state => state.sessions)

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
