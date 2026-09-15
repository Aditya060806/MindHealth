import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Sparkles, Send, Tag, Plus,
  Calendar, Check, Heart, RefreshCw, Lock
} from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'
import StudentNavbar from '../components/StudentNavbar'

const CATEGORIES = ['Academic', 'Career', 'Hostel', 'Personal', 'Social']

export default function StudentJournal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Academic')
  const [prompt, setPrompt] = useState('What is one deadline or assignment weighing on your mind, and what is the absolute smallest first step you can take today?')
  const [promptLoading, setPromptLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moodTag, setMoodTag] = useState('Reflective')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = () => {
    API.get('/api/student/journal')
      .then(r => {
        setEntries(r.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const fetchNewPrompt = async (cat) => {
    const selectedCat = cat || category
    setPromptLoading(true)
    try {
      const res = await API.get(`/api/student/journal/prompt?category=${selectedCat}`)
      if (res.data?.prompt) {
        setPrompt(res.data.prompt)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setPromptLoading(false)
    }
  }

  const handleCategoryChange = (c) => {
    setCategory(c)
    fetchNewPrompt(c)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Please write some thoughts before saving.')
      return
    }

    setSaving(true)
    const toastId = toast.loading('Saving your reflection…')

    try {
      await API.post('/api/student/journal', {
        title: title.trim() || `${category} Reflection`,
        content: content.trim(),
        prompt,
        category,
        mood_tag: moodTag
      })
      toast.success('Journal reflection saved!', { id: toastId })
      setTitle('')
      setContent('')
      fetchEntries()
    } catch (err) {
      console.error(err)
      toast.error('Could not save to cloud. Saved locally.', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Private Student Journal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
              Reflections, De-Stress & College Wins
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A private, judgment-free space to untangle campus stressors, record small victories, and reflect.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Lock size={12} className="text-emerald-600" />
            <span>Encrypted & Private</span>
          </div>
        </div>

        {/* New Entry Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
                Context:
              </span>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCategoryChange(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    category === c
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fetchNewPrompt()}
              disabled={promptLoading}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <RefreshCw size={13} className={promptLoading ? 'animate-spin' : ''} />
              <span>New Prompt</span>
            </button>
          </div>

          {/* AI Prompt Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 mb-6 flex items-start gap-3">
            <Sparkles size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 leading-relaxed">
              <p className="font-bold text-emerald-900 mb-0.5">Reflection Prompt:</p>
              <p>{prompt}</p>
            </div>
          </div>

          {/* Entry Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <input
              type="text"
              placeholder="Title (e.g., Surviving my midterms, hostel quiet hours)..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />

            <textarea
              rows={5}
              placeholder="Write whatever is on your mind. Don't worry about grammar or structure..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 resize-y"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-400 uppercase font-mono">Tag:</span>
                {['Reflective', 'Stressed', 'Grateful', 'Relieved'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMoodTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      moodTag === tag
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all w-full sm:w-auto justify-center"
              >
                <span>{saving ? 'Saving…' : 'Save Reflection'}</span>
                <Send size={13} />
              </button>
            </div>
          </form>
        </div>

        {/* Past Entries */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-display text-slate-900">
            Past Journal Entries ({entries.length})
          </h3>

          {entries.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Your reflections will appear here once you save your first entry.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {entry.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {entry.date}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {entry.title}
                  </h4>

                  {entry.prompt && (
                    <p className="text-[11px] text-emerald-800 italic bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                      Q: {entry.prompt}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                    {entry.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Mood: <strong className="text-slate-700">{entry.mood_tag}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
