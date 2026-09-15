import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import BehaviourTest from './pages/BehaviourTest'
import ChatCounselling from './pages/ChatCounselling'
import FaceEmotion from './pages/FaceEmotion'
import VoiceAnalysis from './pages/VoiceAnalysis'
import FinalSeverity from './pages/FinalSeverity'
import Dashboard from './pages/Dashboard'

/* Clean, instant route navigation without laggy transitions */
function AppRoutes() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/behaviour" element={<BehaviourTest />} />
        <Route path="/chat" element={<ChatCounselling />} />
        <Route path="/face" element={<FaceEmotion />} />
        <Route path="/voice" element={<VoiceAnalysis />} />
        <Route path="/severity" element={<FinalSeverity />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Catch-all: redirect any unknown route to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />

        <Toaster position="top-right"
          containerStyle={{ top: 40, right: 40 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.96)',
              color: '#0f172a',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(16px)',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600'
            }
          }} />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
