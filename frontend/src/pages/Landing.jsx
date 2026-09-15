import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Brain, ArrowRight, CheckCircle2, ShieldAlert, Sparkles,
  Clock, Compass, BookOpen, HeartHandshake, ShieldCheck,
  Moon, Zap, Users, AlertTriangle, GraduationCap, ChevronRight
} from 'lucide-react'
import CrisisSafetyModal from '../components/CrisisSafetyModal'

const STUDENT_DIMENSIONS = [
  {
    icon: GraduationCap,
    title: 'Academic Stress',
    desc: 'Assignment overload, midterm anxiety, fear of poor grades, and lecture concentration fatigue.',
    badge: 'Core Pressure',
    color: 'emerald'
  },
  {
    icon: Clock,
    title: 'Burnout & Fatigue',
    desc: 'Morning depletion, coursework apathy ("I just don’t care anymore"), and staring at screens with zero output.',
    badge: 'Early Warning',
    color: 'teal'
  },
  {
    icon: Compass,
    title: 'Career & Future Dread',
    desc: 'Placement panic, internship rejections, comparing your timeline on LinkedIn, and fear of falling behind.',
    badge: 'Ages 20–24',
    color: 'violet'
  },
  {
    icon: Moon,
    title: 'Sleep & Recovery',
    desc: 'Late-night revenge bedtime scrolling, sleeping under 6 hours, and daytime lecture brain fog.',
    badge: 'Physiology',
    color: 'indigo'
  },
  {
    icon: Users,
    title: 'Campus & Hostel Life',
    desc: 'Loneliness in shared living spaces, roommate friction, homesickness, and feeling disconnected from peers.',
    badge: 'Belonging',
    color: 'cyan'
  },
  {
    icon: Zap,
    title: 'Anxiety & Overthinking',
    desc: 'Mental "what-if" loops, physical tension before exams, and presentation self-consciousness.',
    badge: 'Nervous System',
    color: 'rose'
  }
]

const STUDENT_JOURNEY = [
  { step: '01', title: 'Check In', desc: 'A 30-second daily mood, sleep, and academic pressure pulse.' },
  { step: '02', title: 'Assess', desc: 'A conversational, 4-minute 8-dimension assessment with zero clinical jargon.' },
  { step: '03', title: 'Reflect', desc: 'Discover how sleep deficits, exam weeks, and hostel dynamics interact.' },
  { step: '04', title: 'Take Action', desc: 'Get practical micro-habits, study Pomodoros, and pre-interview grounding.' }
]

export default function Landing() {
  const nav = useNavigate()
  const [crisisOpen, setCrisisOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans flex flex-col">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none cursor-pointer" onClick={() => nav('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Brain size={20} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
                Mind<span className="text-emerald-700">Health</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Student
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#dimensions" className="hover:text-emerald-700 transition-colors">8 Student Dimensions</a>
            <a href="#journey" className="hover:text-emerald-700 transition-colors">How It Works</a>
            <Link to="/focus" className="hover:text-emerald-700 transition-colors">Study & Burnout</Link>
            <Link to="/career" className="hover:text-emerald-700 transition-colors">Career Hub</Link>
            <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">Dashboard</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCrisisOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200"
            >
              Emergency Support
            </button>
            <Link
              to="/assessment"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider mb-6">
          <Sparkles size={13} className="text-emerald-600" />
          <span>Built for College & University Students (Ages 18–25)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Understand how college life is <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">actually</span> affecting your wellbeing.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Not a generic hospital portal. Designed around your real-life pressures: exam anxiety, hostel living, placements, burnout, sleep deficits, and late-night deadlines.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <Link
            to="/assessment"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all scale-100 hover:scale-105"
          >
            <span>Start 4-Minute Assessment</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all"
          >
            <span>Open Student Dashboard</span>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            Zero Clinical Jargon
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            100% Private & Open Access
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            Actionable College Habits
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            24/7 Verified Helplines
          </span>
        </div>
      </section>

      {/* 8 Student Dimensions */}
      <section id="dimensions" className="py-16 bg-white border-y border-slate-200/80 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Purpose-Built Assessment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-2">
              Designed Around Real College Pressures
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generic mental health surveys ask clinical symptom questions. MindHealth screens across the real areas where student life gets heavy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STUDENT_DIMENSIONS.map((dim, idx) => {
              const Icon = dim.icon
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 hover:bg-white transition-all shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {dim.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{dim.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{dim.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Student Journey Steps */}
      <section id="journey" className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            The Student Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-2">
            Understand → Assess → Reflect → Take Action
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STUDENT_JOURNEY.map((j) => (
            <div key={j.step} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
              <span className="text-2xl font-black font-mono text-emerald-700">{j.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{j.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{j.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Relatable Student Dilemmas Callout */}
      <section className="py-12 bg-gradient-to-br from-slate-900 to-slate-950 text-white px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            "Does any of this sound familiar?"
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-300 italic">
                "Everyone on LinkedIn is landing internships and placements, while I feel paralyzed just looking at application forms."
              </p>
              <span className="text-[10px] font-mono text-emerald-400 mt-2 block font-bold">→ Covered in Career Hub</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-300 italic">
                "I sit at my study table for 5 hours, stare at PDFs, and make zero real progress. Am I lazy or burned out?"
              </p>
              <span className="text-[10px] font-mono text-emerald-400 mt-2 block font-bold">→ Covered in Burnout Monitor</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-300 italic">
                "Living in a hostel surrounded by people, yet feeling completely isolated and missing home."
              </p>
              <span className="text-[10px] font-mono text-emerald-400 mt-2 block font-bold">→ Covered in Social Assessment</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all"
            >
              <span>Take Your Assessment in 4 Minutes</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Brain size={14} />
            </div>
            <span className="font-bold text-slate-900">MindHealth Student</span>
            <span>• Built for university students aged 18–25</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setCrisisOpen(true)} className="text-rose-600 font-semibold hover:underline">
              Crisis Helplines (14416)
            </button>
            <Link to="/assessment" className="hover:text-slate-900">Assessment</Link>
            <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
          </div>
        </div>
      </footer>

      <CrisisSafetyModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  )
}
