import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Brain, ArrowRight, ArrowLeft, CheckCircle, Clock,
  HelpCircle, Sparkles, BookOpen, ShieldCheck, AlertCircle
} from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'
import StudentNavbar from '../components/StudentNavbar'

const QUESTIONS = [
  // ── 1. Academic Stress ──
  {
    id: 'acad_1',
    category: 'Academic Stress',
    catColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'Assignment & Workload Pressure',
    question: 'Over the past two weeks, how often have assignment deadlines, lab reports, or coursework felt overwhelming and unmanageable?',
    explanation: 'College coursework often piles up in waves. Understanding your perceived workload helps identify when academic pacing needs a reset.'
  },
  {
    id: 'acad_2',
    category: 'Academic Stress',
    catColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'Examination & Grade Anxiety',
    question: 'How often do you feel intense anxiety, racing thoughts, or mental blanking when preparing for exams or anticipating your grades?',
    explanation: 'Exam anxiety is one of the top stressors for 18–25 year olds and can be managed through early study grounding tools.'
  },
  {
    id: 'acad_3',
    category: 'Academic Stress',
    catColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'Lecture Focus & Concentration',
    question: 'How often do you struggle to stay focused or absorb material during study sessions because your mind wanders to stress?',
    explanation: 'Concentration drops are an early physiological marker of cognitive overload, not personal weakness.'
  },

  // ── 2. Anxiety & Overthinking ──
  {
    id: 'anx_1',
    category: 'Anxiety & Overthinking',
    catColor: 'text-teal-700 bg-teal-50 border-teal-200',
    title: 'Racing Thoughts & Worry Loops',
    question: 'How often do you find your mind constantly looping on "what-ifs" or worst-case scenarios about college and your future?',
    explanation: 'Overthinking traps high-achieving students in mental loops that consume energy before you even begin studying.'
  },
  {
    id: 'anx_2',
    category: 'Anxiety & Overthinking',
    catColor: 'text-teal-700 bg-teal-50 border-teal-200',
    title: 'Physical Stress Sensations',
    question: 'How often do you notice physical signs of stress—such as a tight chest, clutched jaw, shallow breathing, or stomach knots?',
    explanation: 'Your body often registers nervous system stress before you consciously realize you are overwhelmed.'
  },
  {
    id: 'anx_3',
    category: 'Anxiety & Overthinking',
    catColor: 'text-teal-700 bg-teal-50 border-teal-200',
    title: 'Social & Classroom Anxiety',
    question: 'How often do group presentations, asking questions in lecture halls, or walking into campus dining rooms make you feel self-conscious?',
    explanation: 'Campus social anxiety is very common during undergraduate and postgraduate adjustments.'
  },

  // ── 3. Burnout & Mental Fatigue ──
  {
    id: 'burn_1',
    category: 'Burnout & Fatigue',
    catColor: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'Morning Mental Depletion',
    question: 'How often do you wake up feeling completely drained and dreading the mental effort required for the day ahead?',
    explanation: 'Chronic depletion when waking up indicates that sleep is not restoring your nervous system.'
  },
  {
    id: 'burn_2',
    category: 'Burnout & Fatigue',
    catColor: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'Academic Disengagement & Apathy',
    question: 'How often do you feel detached or apathetic toward your studies, thinking "I just don’t care anymore" even when you know you should?',
    explanation: 'Emotional blunting and cynicism toward coursework is a hallmark defense mechanism of burnout.'
  },
  {
    id: 'burn_3',
    category: 'Burnout & Fatigue',
    catColor: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'Productivity vs. Effort Mismatch',
    question: 'How often do you spend hours seated at your desk or laptop, yet feel like you made almost zero real progress?',
    explanation: 'Staring at screens without producing output is often a symptom of mental exhaustion rather than laziness.'
  },

  // ── 4. Sleep & Recovery ──
  {
    id: 'sleep_1',
    category: 'Sleep & Recovery',
    catColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    title: 'Sleep Duration & Consistency',
    question: 'How often in the last 14 days has your sleep schedule been irregular or fallen below 6 hours per night?',
    explanation: 'Sleep deprivation directly impairs memory consolidation, mood regulation, and prefrontal cortex decision making.'
  },
  {
    id: 'sleep_2',
    category: 'Sleep & Recovery',
    catColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    title: 'Trouble Falling Asleep or Daytime Fog',
    question: 'How often does it take you more than 40 minutes to fall asleep due to a racing mind, or do you fight extreme drowsiness during lectures?',
    explanation: 'Difficulty transitioning to sleep is tied to late-night sympathetic nervous system activation.'
  },

  // ── 5. Social Wellbeing & Campus Life ──
  {
    id: 'soc_1',
    category: 'Social & Campus Life',
    catColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    title: 'Campus Loneliness & Belonging',
    question: 'How often do you feel lonely or like an outsider on campus, in your hostel/PG, or among your peer group?',
    explanation: 'It is entirely normal to feel isolated even when surrounded by hundreds of students. Connection requires intentional safety.'
  },
  {
    id: 'soc_2',
    category: 'Social & Campus Life',
    catColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    title: 'Hostel, Roommate, or Family Friction',
    question: 'How often do roommate tensions, hostel living conditions, or homesickness create emotional strain for you?',
    explanation: 'Living spaces in college (hostels, shared PGs) have a massive impact on your baseline daily stress.'
  },

  // ── 6. Career & Future Anxiety ──
  {
    id: 'car_1',
    category: 'Career & Placement Anxiety',
    catColor: 'text-violet-700 bg-violet-50 border-violet-200',
    title: 'Placement & Job Uncertainty',
    question: 'How frequently do thoughts about campus placements, internship rejections, or future job security cause you acute worry?',
    explanation: 'Career anxiety is highest between ages 20 and 24. Acknowledging it reduces its paralyzing hold.'
  },
  {
    id: 'car_2',
    category: 'Career & Placement Anxiety',
    catColor: 'text-violet-700 bg-violet-50 border-violet-200',
    title: 'Peer Comparison (LinkedIn / Social)',
    question: 'How often do you see classmates get offers, internships, or high test scores and immediately feel like you are falling behind?',
    explanation: 'Social comparison bias distorts your timeline by only presenting other people\'s highlight reels.'
  },
  {
    id: 'car_3',
    category: 'Career & Placement Anxiety',
    catColor: 'text-violet-700 bg-violet-50 border-violet-200',
    title: 'Fear of Failure & Expectations',
    question: 'How often does the fear of disappointing your parents, mentors, or yourself prevent you from taking positive action?',
    explanation: 'External pressure often transforms healthy ambition into paralyzing fear of failure.'
  },

  // ── 7. Emotional Wellbeing ──
  {
    id: 'emot_1',
    category: 'Emotional Wellbeing',
    catColor: 'text-rose-700 bg-rose-50 border-rose-200',
    title: 'Persistent Low Mood',
    question: 'Over the last two weeks, how often have you felt down, hopeless, or emotionally weighed down for several days in a row?',
    explanation: 'Screening for persistent emotional lows allows us to surface timely self-care and professional guidance when needed.'
  },
  {
    id: 'emot_2',
    category: 'Emotional Wellbeing',
    catColor: 'text-rose-700 bg-rose-50 border-rose-200',
    title: 'Loss of Interest in Activities',
    question: 'How often have you felt that things you usually enjoy (music, gaming, working out, meeting friends) just weren\'t fun or interesting?',
    explanation: 'Loss of enthusiasm often mirrors neurotransmitter fatigue caused by chronic campus stress.'
  },

  // ── 8. Lifestyle & Digital Wellbeing ──
  {
    id: 'life_1',
    category: 'Digital & Lifestyle Balance',
    catColor: 'text-slate-700 bg-slate-100 border-slate-300',
    title: 'Late-Night Screen Scrolling',
    question: 'How often do you find yourself endlessly scrolling social media or reels late at night to avoid thinking about tomorrow?',
    explanation: 'Revenge bedtime procrastination is a common student coping mechanism to regain a sense of personal freedom.'
  },
  {
    id: 'life_2',
    category: 'Digital & Lifestyle Balance',
    catColor: 'text-slate-700 bg-slate-100 border-slate-300',
    title: 'Movement & Sunlight Deficit',
    question: 'How often do you go whole days staying inside your hostel or study room without intentional walking, physical movement, or sunlight?',
    explanation: 'Lack of natural light and movement drastically diminishes serotonin and dopamine synthesis in college students.'
  }
]

const SCALE_OPTIONS = [
  { value: 0, label: 'Not at all', sub: '0–1 days', desc: 'Rare or never experienced' },
  { value: 1, label: 'Several days', sub: '2–5 days', desc: 'Occasional mild strain' },
  { value: 2, label: 'More than half the days', sub: '6–10 days', desc: 'Frequent noticeable friction' },
  { value: 3, label: 'Nearly every day', sub: '11–14 days', desc: 'Persistent daily impact' }
]

export default function StudentAssessment() {
  const nav = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load draft from localStorage if present
  useEffect(() => {
    try {
      const draft = localStorage.getItem('mindhealth_assessment_draft')
      if (draft) {
        const parsed = JSON.parse(draft)
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed)
        }
      }
    } catch (e) {}
  }, [])

  const currentQ = QUESTIONS[currentIndex]
  const currentVal = answers[currentQ.id]
  const progressPct = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)
  const estMinsRemaining = Math.max(1, Math.ceil((QUESTIONS.length - currentIndex) * 0.25))

  const handleSelect = (val) => {
    const updated = { ...answers, [currentQ.id]: val }
    setAnswers(updated)
    try {
      localStorage.setItem('mindhealth_assessment_draft', JSON.stringify(updated))
    } catch (e) {}

    // Auto-advance after 200ms
    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setShowExplanation(false)
      }
    }, 200)
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowExplanation(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowExplanation(false)
    }
  }

  const handleSubmit = async () => {
    // Check if unanswered questions remain
    const unanswered = QUESTIONS.filter(q => answers[q.id] === undefined)
    if (unanswered.length > 0) {
      toast.error(`Please answer question #${QUESTIONS.indexOf(unanswered[0]) + 1}`)
      setCurrentIndex(QUESTIONS.indexOf(unanswered[0]))
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('Evaluating your college wellbeing profile…')

    try {
      let profile = {}
      try {
        const savedProfile = localStorage.getItem('mindhealth_student_profile')
        if (savedProfile) profile = JSON.parse(savedProfile)
      } catch (e) {}

      const res = await API.post('/api/student-assessment/submit', {
        profile,
        answers
      })

      localStorage.removeItem('mindhealth_assessment_draft')
      localStorage.setItem('mindhealth_latest_assessment', JSON.stringify(res.data))
      toast.success('Assessment complete!', { id: toastId })
      nav('/assessment/result', { state: { result: res.data } })
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit assessment. Please retry.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6 sm:py-10">
        {/* Progress Bar & Header Info */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="text-emerald-700 font-bold">Q{currentIndex + 1}</span> of {QUESTIONS.length}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-mono">
              <Clock size={13} />
              <span>~{estMinsRemaining} min remaining</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card: Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative flex-1 flex flex-col justify-between"
          >
            <div>
              {/* Category Pill */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${currentQ.catColor}`}>
                  {currentQ.category}
                </span>

                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <HelpCircle size={14} />
                  <span>Why we ask this</span>
                </button>
              </div>

              {/* Expandable Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 leading-relaxed"
                >
                  <p className="font-semibold text-emerald-900 mb-0.5">Context for Students:</p>
                  {currentQ.explanation}
                </motion.div>
              )}

              {/* Subtitle & Main Question */}
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                {currentQ.title}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-snug mb-6">
                {currentQ.question}
              </h2>

              {/* Rating Buttons */}
              <div className="space-y-3">
                {SCALE_OPTIONS.map((opt) => {
                  const isSelected = currentVal === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}
                        >
                          {opt.value}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {opt.sub} • {opt.desc}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all"
              >
                <ArrowLeft size={14} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < QUESTIONS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={currentVal === undefined}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-bold shadow transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Sparkles size={14} />
                    <span>{submitting ? 'Analyzing…' : 'Complete & View Results'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Reassurance Footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Private, confidential student screening. Not a clinical medical diagnosis.</span>
        </div>
      </main>
    </div>
  )
}
