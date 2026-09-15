import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles,
  ArrowRight, HeartHandshake, Compass, Clock, BookOpen,
  RefreshCw, ChevronRight, PhoneCall, ShieldCheck, Download
} from 'lucide-react'
import API from '../api'
import StudentNavbar from '../components/StudentNavbar'
import CrisisSafetyModal from '../components/CrisisSafetyModal'

const SEVERITY_BADGES = {
  'Doing Well': {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    desc: 'Your college wellbeing indicators reflect healthy balance and steady coping resources.'
  },
  'Mild Concern': {
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    dot: 'bg-teal-500',
    desc: 'You are managing well overall, with slight strain in specific academic or sleep areas.'
  },
  'Moderate Concern': {
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
    desc: 'College pressures are accumulating. Proactive recovery and boundary setting will prevent burnout.'
  },
  'High Concern': {
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
    desc: 'Significant distress detected across multiple dimensions. Intentional rest and support are strongly encouraged.'
  },
  'Needs Immediate Support': {
    color: 'bg-red-100 text-red-900 border-red-300',
    dot: 'bg-red-600',
    desc: 'Acute stress indicators detected. We strongly recommend speaking with a trusted mentor or professional.'
  }
}

export default function AssessmentResult() {
  const location = useLocation()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [crisisOpen, setCrisisOpen] = useState(false)

  useEffect(() => {
    if (location.state?.result) {
      setData(location.state.result)
      setLoading(false)
    } else {
      // Fetch latest from API
      API.get('/api/student-assessment/latest')
        .then(r => {
          if (r.data?.has_assessment) {
            setData(r.data)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [location.state])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <StudentNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold text-slate-500">
              Generating your college wellbeing profile…
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.scores) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <StudentNavbar />
        <div className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <Brain size={28} />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
            No Assessment Record Found
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You haven't completed your 8-dimension college wellbeing assessment yet. Take 4 minutes to get your personalized student profile.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg"
          >
            <span>Start 4-Minute Assessment</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const scores = data.scores
  const ai = data.ai_insights || {}
  const severity = scores.severity_category || 'Moderate Concern'
  const severityInfo = SEVERITY_BADGES[severity] || SEVERITY_BADGES['Moderate Concern']
  const overall = scores.overall_score || 50
  const isHighRisk = scores.risk_level === 'High' || scores.risk_level === 'Crisis' || severity.includes('Immediate')

  const dimensions = [
    { label: 'Academic Stress', val: scores.academic_stress, color: 'from-amber-500 to-rose-500', isStress: true },
    { label: 'Anxiety & Overthinking', val: scores.anxiety_score, color: 'from-amber-500 to-rose-500', isStress: true },
    { label: 'Burnout Indicator', val: scores.burnout_score, color: 'from-amber-500 to-rose-500', isStress: true },
    { label: 'Career & Future Stress', val: scores.career_stress, color: 'from-amber-500 to-rose-500', isStress: true },
    { label: 'Sleep & Recovery Buffer', val: scores.sleep_score, color: 'from-emerald-500 to-teal-500', isStress: false },
    { label: 'Social & Campus Belonging', val: scores.social_score, color: 'from-emerald-500 to-teal-500', isStress: false },
    { label: 'Emotional Stability', val: scores.emotional_score, color: 'from-emerald-500 to-teal-500', isStress: false },
    { label: 'Lifestyle & Digital Balance', val: scores.lifestyle_score, color: 'from-emerald-500 to-teal-500', isStress: false }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Student Profile Snapshot
                </span>
                <span className="text-xs text-slate-400">
                  {data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                Your College Wellbeing Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                A multi-dimensional breakdown of how academic workload, sleep, hostel life, and career thoughts are interacting right now.
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 self-start md:self-auto">
              <div className="text-right">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Overall Wellbeing
                </p>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-3xl sm:text-4xl font-black font-display text-slate-900">
                    {overall}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/100</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                <Brain size={22} />
              </div>
            </div>
          </div>

          {/* Severity Banner */}
          <div className={`mt-6 p-4 rounded-2xl border flex items-center justify-between gap-4 ${severityInfo.color}`}>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${severityInfo.dot} animate-ping`} />
              <div>
                <span className="text-xs font-mono font-black uppercase tracking-wider">
                  Status: {severity}
                </span>
                <p className="text-xs font-medium opacity-90 mt-0.5">
                  {severityInfo.desc}
                </p>
              </div>
            </div>

            {isHighRisk && (
              <button
                onClick={() => setCrisisOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 font-bold text-xs border border-rose-300 shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <PhoneCall size={13} />
                <span>Talk to Someone</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Dimensional Bar Snapshot */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                8-Dimension Wellbeing Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Direct insights across the 8 key pressure points of university life.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {dimensions.map((d, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{d.label}</span>
                  <span className="font-mono text-slate-900">{d.val}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${d.color} transition-all duration-700`}
                    style={{ width: `${Math.max(5, d.val)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {d.isStress
                    ? (d.val > 65 ? '⚠️ Elevated stress load' : (d.val > 40 ? 'Moderate intensity' : '✅ Low pressure'))
                    : (d.val > 65 ? '✅ Strong protective buffer' : (d.val > 40 ? 'Moderate buffer' : '⚠️ Depleted recovery'))
                  }
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Interpretation Layer */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              AI Student Insights Layer
            </span>
          </div>

          <h3 className="text-xl font-bold font-display text-white mb-2">
            What This Means For Your College Life
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mb-8">
            {ai.overview || "Your profile highlights that coursework deadlines and placement expectations are driving the majority of mental friction. Protecting your sleep boundary is your highest leverage move this week."}
          </p>

          {/* Action Cards: This Week vs. Watch For */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* This Week */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 size={16} />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Actionable Habits For This Week
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {(ai.this_week && ai.this_week.length > 0
                  ? ai.this_week
                  : [
                      "Cap night studying by 11:30 PM to allow 7 hours of restorative sleep.",
                      "Implement a 25-min study sprint with mandatory 5-min screen breaks.",
                      "Take a 15-minute walk outside your hostel/dorm room daily."
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Watch For */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 text-amber-400">
                <AlertTriangle size={16} />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Signals To Watch For
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {(ai.watch_for && ai.watch_for.length > 0
                  ? ai.watch_for
                  : [
                      "Staying in bed scrolling on your phone when feeling overwhelmed.",
                      "Skipping meals or relying entirely on caffeine for late study sessions.",
                      "Withdrawing from friends when deadlines or placement prep intensifies."
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Student Tools */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                Recommended Next Steps:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/tools"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
              >
                3-Min Breathing Reset
              </Link>
              <Link
                to="/focus"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
              >
                Study Pomodoro & Burnout
              </Link>
              <Link
                to="/chat"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                Talk with AI Companion
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            to="/assessment"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} />
            <span>Retake Assessment</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all w-full sm:w-auto justify-center"
          >
            <span>Open Student Dashboard</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Ethical / Medical Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-center text-xs text-slate-500 leading-relaxed">
          <ShieldCheck size={16} className="inline-block text-emerald-600 mr-1 align-text-bottom" />
          <span>
            MindHealth is a self-awareness, screening, and guidance companion. It does not provide clinical diagnoses or prescriptions. If you are experiencing severe emotional distress or thoughts of self-harm, please reach out immediately to your campus health counselor or call the 24/7 Tele-MANAS helpline at <strong>14416</strong>.
          </span>
        </div>
      </main>

      <CrisisSafetyModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  )
}
