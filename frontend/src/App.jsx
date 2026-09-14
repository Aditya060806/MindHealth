import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import BehaviourTest from './pages/BehaviourTest'
import ChatCounselling from './pages/ChatCounselling'
import FaceEmotion from './pages/FaceEmotion'
import VoiceAnalysis from './pages/VoiceAnalysis'
import FinalSeverity from './pages/FinalSeverity'
import Dashboard from './pages/Dashboard'
import Particles from './components/Particles'
import CustomCursor from './components/CustomCursor'
import CinematicTransition from './components/CinematicTransition'

/* Separate component so useLocation hook works inside BrowserRouter */
function AppRoutes() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <div className="relative min-h-screen">
      {/* Particle backdrop only on inner pages (Landing has its own background) */}
      {!isLanding && <Particles />}

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <CinematicTransition><Landing /></CinematicTransition>
            } />
            <Route path="/behaviour" element={
              <CinematicTransition><BehaviourTest /></CinematicTransition>
            } />
            <Route path="/chat" element={
              <CinematicTransition><ChatCounselling /></CinematicTransition>
            } />
            <Route path="/face" element={
              <CinematicTransition><FaceEmotion /></CinematicTransition>
            } />
            <Route path="/voice" element={
              <CinematicTransition><VoiceAnalysis /></CinematicTransition>
            } />
            <Route path="/severity" element={
              <CinematicTransition><FinalSeverity /></CinematicTransition>
            } />
            <Route path="/dashboard" element={
              <CinematicTransition><Dashboard /></CinematicTransition>
            } />
            {/* Catch-all: redirect stale auth routes to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Custom cursor — rendered above everything */}
        <CustomCursor />

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
