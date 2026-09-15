import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import StudentAssessment from './pages/StudentAssessment'
import AssessmentResult from './pages/AssessmentResult'
import Dashboard from './pages/Dashboard'
import DailyCheckIn from './pages/DailyCheckIn'
import StudentAnalytics from './pages/StudentAnalytics'
import FocusBurnoutHub from './pages/FocusBurnoutHub'
import CareerAnxietyHub from './pages/CareerAnxietyHub'
import StudentJournal from './pages/StudentJournal'
import CopingTools from './pages/CopingTools'

// Multimodal Wellness Lab Pages
import ChatCounselling from './pages/ChatCounselling'
import FaceEmotion from './pages/FaceEmotion'
import VoiceAnalysis from './pages/VoiceAnalysis'
import FinalSeverity from './pages/FinalSeverity'
import BehaviourTest from './pages/BehaviourTest'

/* Clean, instant route navigation without laggy transitions */
function AppRoutes() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes location={location} key={location.pathname}>
        {/* Core Student Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/assessment" element={<StudentAssessment />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin" element={<DailyCheckIn />} />
        <Route path="/analytics" element={<StudentAnalytics />} />
        <Route path="/focus" element={<FocusBurnoutHub />} />
        <Route path="/career" element={<CareerAnxietyHub />} />
        <Route path="/journal" element={<StudentJournal />} />
        <Route path="/tools" element={<CopingTools />} />

        {/* Multimodal AI Lab & Legacy Flow Support */}
        <Route path="/chat" element={<ChatCounselling />} />
        <Route path="/face" element={<FaceEmotion />} />
        <Route path="/voice" element={<VoiceAnalysis />} />
        <Route path="/severity" element={<FinalSeverity />} />
        <Route path="/behaviour" element={<BehaviourTest />} />

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
