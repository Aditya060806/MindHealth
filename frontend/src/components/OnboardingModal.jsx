import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Home, BookOpen, Sparkles, Check, X, ArrowRight } from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'

const YEARS = [
  '1st Year / Freshman',
  '2nd Year Undergrad',
  '3rd Year Undergrad',
  'Final Year / Senior',
  'Postgraduate / Masters / PhD'
]

const LIVING = [
  'Hostel / Campus Dorm',
  'Shared PG / Apartment',
  'Commuting from Home / Parents'
]

const STAGES = [
  'Regular Semester Classes',
  'Midterm / Quiz Season',
  'Final Semester Exams',
  'Placement & Internship Drive',
  'Project / Thesis Deadlines',
  'Semester Vacation'
]

const STRESSORS = [
  'Exam Anxiety',
  'Placement / Career Dread',
  'Sleep Schedule',
  'Hostel / Roommate Friction',
  'Loneliness & Homesickness',
  'Peer Comparison (LinkedIn/Insta)',
  'Procrastination',
  'Financial Stress'
]

export default function OnboardingModal({ isOpen, onClose, onSaved }) {
  const [form, setForm] = useState({
    age: 20,
    student_year: '2nd Year Undergrad',
    field_of_study: 'Engineering & Tech',
    living_situation: 'Hostel / Campus Dorm',
    academic_stage: 'Regular Semester Classes',
    primary_stressors: ['Exam Anxiety', 'Placement / Career Dread']
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      API.get('/api/student/profile')
        .then(r => {
          if (r.data) {
            setForm(prev => ({
              ...prev,
              age: r.data.age || 20,
              student_year: r.data.student_year || prev.student_year,
              field_of_study: r.data.field_of_study || prev.field_of_study,
              living_situation: r.data.living_situation || prev.living_situation,
              academic_stage: r.data.academic_stage || prev.academic_stage,
              primary_stressors: r.data.primary_stressors || prev.primary_stressors
            }))
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  const toggleStressor = (item) => {
    setForm(prev => {
      const exists = prev.primary_stressors.includes(item)
      const updated = exists
        ? prev.primary_stressors.filter(s => s !== item)
        : [...prev.primary_stressors, item]
      return { ...prev, primary_stressors: updated }
    })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      await API.put('/api/student/profile', form)
      localStorage.setItem('mindhealth_student_profile', JSON.stringify(form))
      toast.success('Student profile updated!')
      onSaved?.(form)
      onClose()
    } catch (err) {
      // Still save locally for seamless guest experience
      localStorage.setItem('mindhealth_student_profile', JSON.stringify(form))
      toast.success('Preferences saved locally!')
      onSaved?.(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-100 font-bold">
                Student Context
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-white">
              Personalize Your College Experience
            </h3>
            <p className="text-xs text-emerald-50/90 mt-1">
              Help MindHealth tailor daily recommendations, burnout warnings, and assessments to your real college environment.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Age & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Your Age (18–25)
                </label>
                <input
                  type="number"
                  min="18"
                  max="25"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 20 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Year of Study
                </label>
                <select
                  value={form.student_year}
                  onChange={e => setForm({ ...form, student_year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Living Arrangement */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Living Arrangement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {LIVING.map(opt => {
                  const active = form.living_situation === opt
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setForm({ ...form, living_situation: opt })}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        active
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Current Academic Phase */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Current College Phase
              </label>
              <select
                value={form.academic_stage}
                onChange={e => setForm({ ...form, academic_stage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Primary Stressors */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Top Pressures on Your Mind Right Now
              </label>
              <div className="flex flex-wrap gap-2">
                {STRESSORS.map(s => {
                  const selected = form.primary_stressors.includes(s)
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleStressor(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {selected && <Check size={12} />}
                      <span>{s}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>{loading ? 'Saving...' : 'Save Student Profile'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
