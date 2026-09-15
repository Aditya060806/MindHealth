import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Pause, RotateCcw, AlertTriangle, CheckCircle2,
  Clock, Coffee, ShieldAlert, Sparkles, Brain, ArrowRight
} from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'
import StudentNavbar from '../components/StudentNavbar'

export default function FocusBurnoutHub() {
  // Timer State
  const [mode, setMode] = useState('focus') // 'focus' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [taskName, setTaskName] = useState('Coursework Study Block')
  const [completedSessions, setCompletedSessions] = useState(0)

  // Burnout State
  const [burnoutStatus, setBurnoutStatus] = useState({
    burnout_risk: 'Low',
    burnout_index: 45,
    is_warning: false,
    signals: ['Healthy baseline recovery rhythm.'],
    advice: 'Your pacing is in a safe balance. Keep taking micro-breaks every 50 minutes.'
  })

  // Procrastination Reflection
  const [showProcrastinationTool, setShowProcrastinationTool] = useState(false)
  const [smallestStep, setSmallestStep] = useState('')

  useEffect(() => {
    API.get('/api/student/burnout/status')
      .then(r => {
        if (r.data) setBurnoutStatus(r.data)
      })
      .catch(() => {})
  }, [])

  // Timer Interval
  useEffect(() => {
    let timer = null
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      if (mode === 'focus') {
        toast.success('Great focus session! Take a mandatory 5-minute break away from screens.', { duration: 5000 })
        setCompletedSessions(prev => prev + 1)
        setMode('break')
        setTimeLeft(5 * 60)
        // Log study session
        API.post('/api/student/study/session', {
          subject_or_task: taskName,
          duration_minutes: 25,
          stress_rating: 3,
          burnout_flag: burnoutStatus.is_warning
        }).catch(() => {})
      } else {
        toast.success('Break complete. Ready to return when you feel energized.')
        setMode('focus')
        setTimeLeft(25 * 60)
      }
    }
    return () => clearInterval(timer)
  }, [isRunning, timeLeft, mode, taskName, burnoutStatus])

  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressPct = mode === 'focus'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Header */}
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Healthy Productivity & Recovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
            Focus Timer & Burnout Early-Warning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Protect your cognitive energy with healthy Pomodoro pacing and early burnout signals.
          </p>
        </div>

        {/* Burnout Early-Warning Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          burnoutStatus.is_warning
            ? 'bg-amber-50/90 border-amber-300 shadow-lg'
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                burnoutStatus.is_warning
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 animate-pulse'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {burnoutStatus.is_warning ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Burnout Indicator
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    burnoutStatus.is_warning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {burnoutStatus.burnout_risk} Risk
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {burnoutStatus.is_warning
                    ? 'Elevated Strain Detected — Prioritize Recovery'
                    : 'Sustainable Study Cadence'}
                </h3>
              </div>
            </div>

            <div className="text-xs text-slate-600 max-w-sm">
              <p className="font-semibold text-slate-800 mb-0.5">Advice:</p>
              <p>{burnoutStatus.advice}</p>
            </div>
          </div>

          {/* Signals */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap gap-2">
            {burnoutStatus.signals.map((sig, i) => (
              <span key={i} className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                • {sig}
              </span>
            ))}
          </div>
        </div>

        {/* Focus Timer Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Timer Display */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-8 border border-slate-200">
              <button
                onClick={() => {
                  setMode('focus')
                  setTimeLeft(25 * 60)
                  setIsRunning(false)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'focus'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Study Sprint (25m)
              </button>
              <button
                onClick={() => {
                  setMode('break')
                  setTimeLeft(5 * 60)
                  setIsRunning(false)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'break'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Restorative Break (5m)
              </button>
            </div>

            {/* Task Name Input */}
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="What are you focusing on?"
              className="text-center text-sm font-semibold text-slate-700 mb-6 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 max-w-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Clock Numbers */}
            <div className="relative my-4">
              <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <p className="text-xs font-mono font-semibold text-slate-400 mt-2 uppercase tracking-wider">
                {mode === 'focus' ? 'Keep Notifications Muted' : 'Step Away From Screen'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center gap-2 transition-all scale-100 hover:scale-105 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                <span>{isRunning ? 'Pause' : 'Start Session'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Session Counter */}
            <div className="mt-8 text-xs font-mono text-slate-400">
              Completed today: <span className="font-bold text-slate-800">{completedSessions} sprints</span> (~{completedSessions * 25} mins focused)
            </div>
          </div>

          {/* Anti-Procrastination & Grounding Box */}
          <div className="space-y-6">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-2 text-emerald-800">
                <Brain size={16} />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  5-Minute Action Barrier
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Feeling resistance to starting a daunting paper or assignment? Reduce the intimidation barrier:
              </p>
              <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-xs font-medium text-slate-800 space-y-2">
                <p className="font-bold text-emerald-950">The 5-Minute Rule:</p>
                <p className="text-slate-600">
                  Commit to working on the task for strictly 5 minutes. You have permission to stop after that. 80% of the time, overcoming the activation friction is all you need.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Healthy Study Principles
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>No late-night all-nighters before major exams—memory recall drops ~35%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>Hydrate with water rather than relying entirely on energy drinks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>Physical posture: keep shoulders relaxed and jaw unclasped.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
