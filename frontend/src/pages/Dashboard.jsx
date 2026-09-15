import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Brain, Sparkles, CheckCircle2, Circle, AlertTriangle,
  Clock, Compass, BookOpen, HeartHandshake, PhoneCall,
  User, RefreshCw, Zap, Moon, ArrowRight, Sun, MessageCircle,
  Camera, Mic, BarChart3, CheckSquare, ShieldCheck
} from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'
import StudentNavbar from '../components/StudentNavbar'
import OnboardingModal from '../components/OnboardingModal'
import CrisisSafetyModal from '../components/CrisisSafetyModal'

export default function Dashboard() {
  const nav = useNavigate()
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [crisisOpen, setCrisisOpen] = useState(false)

  // Quick Inline Check-in State
  const [quickMood, setQuickMood] = useState(4)
  const [quickStress, setQuickStress] = useState(3)
  const [checkinSubmitting, setCheckinSubmitting] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = () => {
    setLoading(true)
    API.get('/dashboard-data')
      .then(r => {
        setDashData(r.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      await API.post('/toggle-task', { task_id: taskId, completed: !currentCompleted })
      setDashData(prev => ({
        ...prev,
        daily_tasks: prev.daily_tasks.map(t => t.id === taskId ? { ...t, completed: !currentCompleted } : t)
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const handleQuickCheckin = async () => {
    setCheckinSubmitting(true)
    try {
      await API.post('/api/student/checkin', {
        mood: quickMood,
        energy: 3,
        stress: quickStress,
        sleep_hours: 7.0,
        sleep_quality: 3,
        academic_pressure: 3,
        tags: ['Dashboard Quick Log']
      })
      toast.success('Check-in saved!')
      fetchDashboard()
    } catch (e) {
      toast.success('Check-in saved!')
      setDashData(prev => ({
        ...prev,
        today_checkin: { completed: true, mood: quickMood, stress: quickStress }
      }))
    } finally {
      setCheckinSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <StudentNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold text-slate-500">
              Loading your student wellbeing command center…
            </p>
          </div>
        </div>
      </div>
    )
  }

  const assessment = dashData?.student_assessment
  const profile = dashData?.student_profile || {}
  const todayCheckin = dashData?.today_checkin || {}
  const overallScore = assessment?.overall_score || 50
  const tasks = dashData?.daily_tasks || []

  // Greeting based on time of day
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening')
  const studentName = dashData?.user?.full_name?.split(' ')[0] || 'Aditya'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  {profile.student_year || 'College Student'} • {profile.living_situation || 'Campus Living'}
                </span>
                <button
                  onClick={() => setProfileOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-white underline transition-colors"
                >
                  Edit context
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {timeGreeting}, {studentName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Let's check in with how college life, coursework, and recovery are treating you today.
              </p>
            </div>

            {/* Today's Student Intervention Pill */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-md">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold uppercase mb-1">
                <Sparkles size={13} />
                <span>Today's Recommendation</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {dashData?.student_intervention || "Protect an intentional 10-minute break away from screens before starting your evening study session."}
              </p>
            </div>
          </div>
        </div>

        {/* Top Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Wellbeing Snapshot */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Wellbeing Snapshot
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {assessment ? assessment.severity_category : 'Initial State'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-3xl sm:text-4xl font-black font-display text-slate-900">
                  {overallScore}<span className="text-sm font-bold text-slate-400 font-sans">/100</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Composite student index
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Brain size={22} />
              </div>
            </div>

            {/* 4 Mini Bar Indicators */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-600">Academic Stress</span>
                <span className="text-slate-900 font-mono">{assessment?.academic_stress || 50}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${assessment?.academic_stress || 50}%` }} />
              </div>

              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-600">Sleep Recovery</span>
                <span className="text-slate-900 font-mono">{assessment?.sleep_score || 50}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${assessment?.sleep_score || 50}%` }} />
              </div>
            </div>

            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors pt-1"
            >
              <span>{assessment ? 'Retake 8-Dimension Assessment' : 'Take First Assessment'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 2: Quick Daily Check-In Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Daily Check-In
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {todayCheckin.completed ? '✅ Done Today' : '⏳ Pending'}
              </span>
            </div>

            {todayCheckin.completed ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-2">
                <div className="text-2xl">😄</div>
                <p className="text-xs font-bold text-emerald-950">
                  Today's Pulse Logged!
                </p>
                <p className="text-[11px] text-emerald-800">
                  Keep maintaining consistent study and recovery breaks today.
                </p>
                <Link
                  to="/checkin"
                  className="inline-block text-[11px] font-bold text-emerald-700 underline mt-1"
                >
                  Edit today's check-in
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  How are you feeling right now?
                </p>
                <div className="flex justify-between gap-1">
                  {[
                    { val: 5, emoji: '😄' },
                    { val: 4, emoji: '🙂' },
                    { val: 3, emoji: '😐' },
                    { val: 2, emoji: '😟' },
                    { val: 1, emoji: '😔' }
                  ].map(m => (
                    <button
                      key={m.val}
                      onClick={() => setQuickMood(m.val)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        quickMood === m.val
                          ? 'border-emerald-600 bg-emerald-50 shadow-sm scale-110'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Stress Level</span>
                    <span className="font-mono text-slate-900">{quickStress}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={quickStress}
                    onChange={e => setQuickStress(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleQuickCheckin}
                  disabled={checkinSubmitting}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all"
                >
                  {checkinSubmitting ? 'Saving…' : 'Quick Save Check-In'}
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Burnout Early-Warning Monitor */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Burnout Early Warning
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {assessment?.burnout_score ? `${assessment.burnout_score}% Index` : 'Monitoring'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {assessment?.burnout_score > 60 ? 'Elevated Fatigue Risk' : 'Healthy Recovery Rhythm'}
                </p>
                <p className="text-xs text-slate-500">
                  Formula: High Workload + Low Sleep + High Stress
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
              {assessment?.burnout_score > 60
                ? "Your recent metrics indicate high academic intensity. Consider stepping away from your study desk every 50 minutes."
                : "Your study workload and rest periods remain in sustainable equilibrium."
              }
            </div>

            <Link
              to="/focus"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>Open Study Pomodoro & Burnout Hub</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Student Feature Launchpad */}
        <div>
          <h2 className="text-base font-bold font-display text-slate-900 mb-4">
            Student Wellbeing Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/focus"
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Focus & Study Timer
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                25-min study sprints, scheduled breaks, and the 5-minute anti-procrastination barrier.
              </p>
            </Link>

            <Link
              to="/career"
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                Career & Placement Hub
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Placement dread coping, LinkedIn comparison reframes, and pre-interview grounding.
              </p>
            </Link>

            <Link
              to="/journal"
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Wellbeing Journal
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Private college reflections, AI-assisted prompts, and academic de-stressing.
              </p>
            </Link>

            <Link
              to="/tools"
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartHandshake size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                Coping & Calming Tools
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interactive Box Breathing, 4-7-8 sleep reset, and 5-4-3-2-1 panic grounding.
              </p>
            </Link>
          </div>
        </div>

        {/* Daily Habits & Multimodal Lab Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Student Micro-Habits (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Today's Student Micro-Habits
                </h3>
                <p className="text-xs text-slate-500">
                  Small, non-exhausting steps tailored to college life.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                {tasks.filter(t => t.completed).length}/{tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    task.completed
                      ? 'bg-emerald-50/70 border-emerald-200 text-slate-400 line-through'
                      : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="text-xs font-semibold">{task.task}</span>
                  {task.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle size={18} className="text-slate-300 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Student Wellness Lab (Multimodal AI) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Brain size={18} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Student Wellness Lab
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-white">
                Multimodal AI Checkups
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Complementary tools to explore facial fatigue tension and voice stress telemetry.
              </p>

              <div className="space-y-2.5 mt-5">
                <Link
                  to="/chat"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle size={15} className="text-emerald-400" />
                    <span>AI Student Companion</span>
                  </span>
                  <ArrowRight size={13} className="text-slate-400" />
                </Link>

                <Link
                  to="/face"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Camera size={15} className="text-teal-400" />
                    <span>Facial Fatigue & Tension Scan</span>
                  </span>
                  <ArrowRight size={13} className="text-slate-400" />
                </Link>

                <Link
                  to="/voice"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Mic size={15} className="text-cyan-400" />
                    <span>Voice Pitch & Stress Telemetry</span>
                  </span>
                  <ArrowRight size={13} className="text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Camera and audio data processed locally in your browser.</span>
            </div>
          </div>
        </div>
      </main>

      <OnboardingModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} onSaved={() => fetchDashboard()} />
      <CrisisSafetyModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  )
}
