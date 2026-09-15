import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Brain, ShieldAlert, User, Menu, X, Sparkles,
  BarChart3, CheckSquare, Clock, Compass, BookOpen,
  HeartHandshake, ChevronDown
} from 'lucide-react'
import CrisisSafetyModal from './CrisisSafetyModal'
import OnboardingModal from './OnboardingModal'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { label: 'Assessment', path: '/assessment', icon: Brain },
  { label: 'Check-In', path: '/checkin', icon: CheckSquare },
  { label: 'Trends', path: '/analytics', icon: BarChart3 },
  { label: 'Focus & Study', path: '/focus', icon: Clock },
  { label: 'Career Hub', path: '/career', icon: Compass },
  { label: 'Journal', path: '/journal', icon: BookOpen },
  { label: 'Coping Tools', path: '/tools', icon: HeartHandshake }
]

export default function StudentNavbar() {
  const loc = useLocation()
  const nav = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [crisisOpen, setCrisisOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [studentContext, setStudentContext] = useState({
    year: '2nd Year',
    living: 'Hostel'
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mindhealth_student_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        setStudentContext({
          year: parsed.student_year ? parsed.student_year.split(' ')[0] + ' ' + (parsed.student_year.split(' ')[1] || 'Year') : 'Student',
          living: parsed.living_situation ? parsed.living_situation.split(' ')[0] : 'Campus'
        })
      }
    } catch (e) {}
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Brain size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
                  Mind<span className="text-emerald-700">Health</span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Student
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 hidden sm:block">
                Ages 18–25 Wellbeing
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((item) => {
              const active = loc.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Context Badge */}
            <button
              onClick={() => setProfileOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
              title="Edit student profile context"
            >
              <User size={13} className="text-emerald-600" />
              <span>{studentContext.year} • {studentContext.living}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {/* Crisis Support Button */}
            <button
              onClick={() => setCrisisOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200/80 transition-all"
            >
              <ShieldAlert size={14} className="text-rose-600 animate-pulse" />
              <span className="hidden xs:inline">Crisis</span> Support
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const active = loc.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <button
              onClick={() => {
                setMobileOpen(false)
                setProfileOpen(true)
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2">
                <User size={14} className="text-emerald-600" />
                <span>Student Context: {studentContext.year} ({studentContext.living})</span>
              </span>
              <span className="text-emerald-700 font-bold">Edit</span>
            </button>
          </div>
        )}
      </header>

      {/* Modals */}
      <CrisisSafetyModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
      <OnboardingModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSaved={(data) => {
          setStudentContext({
            year: data.student_year ? data.student_year.split(' ')[0] + ' ' + (data.student_year.split(' ')[1] || 'Year') : 'Student',
            living: data.living_situation ? data.living_situation.split(' ')[0] : 'Campus'
          })
        }}
      />
    </>
  )
}
