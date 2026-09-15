import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, Briefcase, Award, Sparkles, Heart,
  ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react'
import StudentNavbar from '../components/StudentNavbar'

const REFRAMES = [
  {
    trigger: "Everyone on LinkedIn is getting 20 LPA packages and top internships.",
    reframe: "LinkedIn is a heavily curated highlight reel. Nobody posts the 80 rejected applications, the self-doubt, or the compromises. Your timeline is unique, and early career entry is a marathon, not a sprint.",
    action: "Set a 15-minute daily limit on career feeds. Measure progress against your yesterday self, not someone else's highlight."
  },
  {
    trigger: "I failed a technical interview or was rejected from an internship.",
    reframe: "An interview tests interview performance on one specific day, not your permanent intelligence or career ceiling. Every rejection is data on what to refine (communication, DSA, projects), not an indictment of your worth.",
    action: "Write down 2 constructive takeaways, then deliberately take the rest of the evening off to recharge."
  },
  {
    trigger: "I am not 100% sure what field or career I want to pursue.",
    reframe: "Most professionals change specializations 3 to 5 times in their 20s. College is about developing core problem-solving, communication, and work ethic. Clarity comes from taking small actions, not from overthinking in bed.",
    action: "Pick one small project or domain to explore for 3 weeks without committing your entire life to it."
  }
]

const GROUNDING_STEPS = [
  { step: '1', title: 'Physiological Sigh', desc: 'Take two quick deep inhales through your nose, followed by one long, slow exhale through your mouth. Repeat 3 times to immediately lower heart rate.' },
  { step: '2', title: 'Remember the Human', desc: 'The interviewer is simply another person with deadlines, coffee spills, and worries of their own. They are looking for a capable collaborator, not perfection.' },
  { step: '3', title: 'Permission to Pause', desc: 'When asked a challenging question, say: "That is a great question. Let me take 5 seconds to gather my thoughts." It shows composure, not weakness.' }
]

export default function CareerAnxietyHub() {
  const [activeReframe, setActiveReframe] = useState(0)
  const [skills, setSkills] = useState([
    'Curiosity & ability to learn new tools fast',
    'Reliability when teammates need help',
    'Empathy and active listening',
    'Resilience after academic setbacks'
  ])
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Header */}
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
            Ages 18–25 Specialization
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
            Career, Placement & Future Anxiety Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evidence-based tools to navigate placement season, interview dread, and social media comparison.
          </p>
        </div>

        {/* Comparison Reframe Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-violet-700">
            <Compass size={18} />
            <h2 className="text-base font-bold font-display text-slate-900">
              Reframing Comparison & Career Dread
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {REFRAMES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReframe(idx)}
                className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                  activeReframe === idx
                    ? 'bg-violet-50/90 border-violet-500 text-violet-950 shadow-sm ring-1 ring-violet-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                Trigger #{idx + 1}:
                <p className="font-normal text-slate-600 line-clamp-2 mt-1">
                  "{item.trigger}"
                </p>
              </button>
            ))}
          </div>

          {/* Active Reframe Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900 to-slate-950 text-white shadow-xl relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 font-bold block mb-2">
              Mental Reframe
            </span>
            <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed mb-4">
              "{REFRAMES[activeReframe].reframe}"
            </p>
            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-violet-300 font-semibold">
              <Sparkles size={14} className="flex-shrink-0" />
              <span>Recommended Action: {REFRAMES[activeReframe].action}</span>
            </div>
          </div>
        </div>

        {/* Pre-Interview Emergency Grounding */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                2-Minute Pre-Interview & Presentation Grounding
              </h3>
              <p className="text-xs text-slate-500">
                Use these three rapid resets before stepping into an interview or presentation room.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              Immediate Relief
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GROUNDING_STEPS.map((step) => (
              <div key={step.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center justify-center">
                  {step.step}
                </span>
                <h4 className="text-xs font-bold text-slate-800">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What Grades Don't Show: Student Identity Inventory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-emerald-700">
            <Award size={18} />
            <h3 className="text-base font-bold font-display text-slate-900">
              What Your GPA & Placement Offers Don't Measure
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Your self-worth is vastly broader than an exam score or offer letter. Record strengths you bring that tests cannot quantify.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((s, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{s}</span>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Add another strength (e.g., Quick to admit mistakes, Good teammate)..."
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Add
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
