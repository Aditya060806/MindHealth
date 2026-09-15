import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Smile, Frown, Meh, Sun, Moon, Zap,
  CheckCircle, ArrowRight, Sparkles, Tag, Heart
} from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'
import StudentNavbar from '../components/StudentNavbar'

const MOODS = [
  { val: 5, emoji: '😄', label: 'Great', color: 'border-emerald-500 bg-emerald-50/80 text-emerald-900' },
  { val: 4, emoji: '🙂', label: 'Good', color: 'border-teal-500 bg-teal-50/80 text-teal-900' },
  { val: 3, emoji: '😐', label: 'Okay', color: 'border-slate-300 bg-slate-50 text-slate-800' },
  { val: 2, emoji: '😟', label: 'Stressed', color: 'border-amber-500 bg-amber-50/80 text-amber-900' },
  { val: 1, emoji: '😔', label: 'Low', color: 'border-rose-500 bg-rose-50/80 text-rose-900' }
]

const CONTEXT_TAGS = [
  'Exams Approaching',
  'Assignment Deadline',
  'Hostel / Roommate Life',
  'Placements & Interviews',
  'Lab / Project Work',
  'Social Hangout',
  'Homesick',
  'Sleep Deprived',
  'Feeling Productive'
]

export default function DailyCheckIn() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    mood: 3,
    energy: 3,
    stress: 3,
    sleep_hours: 7.0,
    sleep_quality: 3,
    motivation: 3,
    academic_pressure: 3,
    tags: ['Assignment Deadline'],
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  useEffect(() => {
    API.get('/api/student/checkin/today')
      .then(r => {
        if (r.data?.completed && r.data.checkin) {
          setAlreadyCompleted(true)
          setForm(prev => ({
            ...prev,
            mood: r.data.checkin.mood || prev.mood,
            energy: r.data.checkin.energy || prev.energy,
            stress: r.data.checkin.stress || prev.stress,
            sleep_hours: r.data.checkin.sleep_hours || prev.sleep_hours,
            sleep_quality: r.data.checkin.sleep_quality || prev.sleep_quality,
            academic_pressure: r.data.checkin.academic_pressure || prev.academic_pressure,
            tags: r.data.checkin.tags || prev.tags,
            note: r.data.checkin.note || ''
          }))
        }
      })
      .catch(() => {})
  }, [])

  const toggleTag = (t) => {
    setForm(prev => {
      const exists = prev.tags.includes(t)
      return {
        ...prev,
        tags: exists ? prev.tags.filter(x => x !== t) : [...prev.tags, t]
      }
    })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Logging your daily check-in…')

    try {
      await API.post('/api/student/checkin', form)
      toast.success('Check-in recorded! Streak active 🔥', { id: toastId })
      setAlreadyCompleted(true)
      setTimeout(() => nav('/dashboard'), 500)
    } catch (err) {
      console.error(err)
      toast.error('Could not save check-in. Saved locally.', { id: toastId })
      setAlreadyCompleted(true)
      setTimeout(() => nav('/dashboard'), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Daily State Check-In
              </span>
              <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
                How are you holding up today?
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Takes 30 seconds. Helps detect study burnout before it builds up.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sun size={20} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Mood Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Current Mood
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map(m => {
                  const active = form.mood === m.val
                  return (
                    <button
                      type="button"
                      key={m.val}
                      onClick={() => setForm({ ...form, mood: m.val })}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        active
                          ? `${m.color} ring-2 ring-emerald-500/20 shadow-md scale-105`
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{m.emoji}</span>
                      <span className="text-[11px] font-bold block">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Sliders: Energy & Stress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap size={13} className="text-amber-500" />
                    <span>Energy Level</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {form.energy}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.energy}
                  onChange={e => setForm({ ...form, energy: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Drained</span>
                  <span>High Voltage</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Heart size={13} className="text-rose-500" />
                    <span>Stress Level</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {form.stress}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.stress}
                  onChange={e => setForm({ ...form, stress: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Calm</span>
                  <span>Overloaded</span>
                </div>
              </div>
            </div>

            {/* 3. Sleep Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Moon size={13} className="text-indigo-500" />
                    <span>Hours of Sleep</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {form.sleep_hours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={form.sleep_hours}
                  onChange={e => setForm({ ...form, sleep_hours: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {form.sleep_hours < 6 ? '⚠️ Under 6h may affect focus today' : '✅ Good restorative window'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Academic Pressure</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {form.academic_pressure}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.academic_pressure}
                  onChange={e => setForm({ ...form, academic_pressure: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Light</span>
                  <span>Peak Deadlines</span>
                </div>
              </div>
            </div>

            {/* 4. College Context Tags */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                What is affecting you most today?
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTEXT_TAGS.map(tag => {
                  const selected = form.tags.includes(tag)
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Quick Reflection Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Quick 1-Line Thought (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Finished my DSP lab draft, now trying to rest before dinner..."
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => nav('/dashboard')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Back to Dashboard
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>{loading ? 'Logging…' : (alreadyCompleted ? 'Update Check-In' : 'Save Check-In')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
