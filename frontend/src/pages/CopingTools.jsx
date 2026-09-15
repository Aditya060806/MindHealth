import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Wind, Moon, Eye, PhoneCall,
  Play, Pause, RotateCcw, Sparkles, ShieldAlert, LifeBuoy
} from 'lucide-react'
import StudentNavbar from '../components/StudentNavbar'
import CrisisSafetyModal from '../components/CrisisSafetyModal'

export default function CopingTools() {
  const [activeTool, setActiveTool] = useState('box') // 'box', '478', 'grounding', 'crisis'
  const [breathPhase, setBreathPhase] = useState('Inhale')
  const [breathCount, setBreathCount] = useState(4)
  const [isBreathing, setIsBreathing] = useState(false)
  const [crisisOpen, setCrisisOpen] = useState(false)

  // Box Breathing Loop (4-4-4-4)
  useEffect(() => {
    let timer = null
    if (isBreathing && activeTool === 'box') {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(curr => {
              if (curr === 'Inhale') return 'Hold'
              if (curr === 'Hold') return 'Exhale'
              if (curr === 'Exhale') return 'Hold Empty'
              return 'Inhale'
            })
            return 4
          }
          return prev - 1
        })
      }, 1000)
    } else if (isBreathing && activeTool === '478') {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold')
              return 7
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale')
              return 8
            } else {
              setBreathPhase('Inhale')
              return 4
            }
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isBreathing, activeTool, breathPhase])

  const toggleBreathing = () => {
    if (!isBreathing) {
      setBreathPhase('Inhale')
      setBreathCount(4)
      setIsBreathing(true)
    } else {
      setIsBreathing(false)
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
              Student Calm Lab
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
              Interactive Coping & Calming Tools
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Physiological resets designed for acute exam panic, insomnia, and nervous system decompression.
            </p>
          </div>

          <button
            onClick={() => setCrisisOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 shadow-sm self-start sm:self-auto"
          >
            <LifeBuoy size={15} className="text-rose-600 animate-pulse" />
            <span>Emergency Helplines</span>
          </button>
        </div>

        {/* Tool Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'box', label: 'Box Breathing', sub: 'Instant Panic Reset', icon: Wind },
            { id: '478', label: '4-7-8 Sleep Reset', sub: 'Insomnia Relief', icon: Moon },
            { id: 'grounding', label: '5-4-3-2-1 Grounding', sub: 'Exam Brain Freeze', icon: Eye },
            { id: 'hotlines', label: 'Crisis Hotlines', sub: '24/7 Verified Support', icon: PhoneCall }
          ].map(t => {
            const Icon = t.icon
            const active = activeTool === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTool(t.id)
                  setIsBreathing(false)
                }}
                className={`p-4 rounded-3xl border text-left transition-all ${
                  active
                    ? 'bg-white border-emerald-600 shadow-lg ring-2 ring-emerald-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                  active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon size={16} />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{t.label}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.sub}</p>
              </button>
            )
          })}
        </div>

        {/* Active Tool View */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
          
          {/* Tool 1: Box Breathing */}
          {activeTool === 'box' && (
            <div className="text-center max-w-lg mx-auto py-4 space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Tactical De-Stress (Navy SEAL Protocol)
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 mt-2">
                  Box Breathing (4-4-4-4)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Inhale for 4 seconds, hold for 4, exhale for 4, and hold empty for 4. Activates your vagus nerve to stop acute racing thoughts.
                </p>
              </div>

              {/* Visual Expanding Circle */}
              <div className="relative w-60 h-60 mx-auto flex items-center justify-center my-8">
                <motion.div
                  animate={{
                    scale: isBreathing ? (breathPhase === 'Inhale' || breathPhase === 'Hold' ? 1.35 : 0.85) : 1,
                    borderColor: breathPhase === 'Hold' || breathPhase === 'Hold Empty' ? '#059669' : '#0D9488'
                  }}
                  transition={{ duration: 3.8, ease: 'easeInOut' }}
                  className="w-48 h-48 rounded-full border-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-100/60 shadow-xl flex flex-col items-center justify-center"
                >
                  <span className="text-sm font-bold text-emerald-950 font-display uppercase tracking-wider">
                    {isBreathing ? breathPhase : 'Ready'}
                  </span>
                  {isBreathing && (
                    <span className="text-4xl font-black font-mono text-emerald-700 mt-1">
                      {breathCount}
                    </span>
                  )}
                </motion.div>
              </div>

              <button
                onClick={toggleBreathing}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all scale-100 hover:scale-105"
              >
                {isBreathing ? 'Pause Breathing' : 'Start 2-Minute Session'}
              </button>
            </div>
          )}

          {/* Tool 2: 4-7-8 Sleep Reset */}
          {activeTool === '478' && (
            <div className="text-center max-w-lg mx-auto py-4 space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Pre-Sleep Parasympathetic Reset
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 mt-2">
                  4-7-8 Deep Sleep Technique
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Inhale through the nose for 4s, hold gently for 7s, and exhale slowly through mouth for 8s. A natural tranquilizer for late-night college insomnia.
                </p>
              </div>

              {/* Visual Expanding Circle */}
              <div className="relative w-60 h-60 mx-auto flex items-center justify-center my-8">
                <motion.div
                  animate={{
                    scale: isBreathing ? (breathPhase === 'Inhale' ? 1.4 : (breathPhase === 'Hold' ? 1.4 : 0.8)) : 1
                  }}
                  transition={{ duration: breathPhase === 'Hold' ? 6.8 : (breathPhase === 'Exhale' ? 7.8 : 3.8), ease: 'easeInOut' }}
                  className="w-48 h-48 rounded-full border-4 border-teal-500 bg-gradient-to-br from-teal-50 to-indigo-100/60 shadow-xl flex flex-col items-center justify-center"
                >
                  <span className="text-sm font-bold text-teal-950 font-display uppercase tracking-wider">
                    {isBreathing ? breathPhase : 'Ready'}
                  </span>
                  {isBreathing && (
                    <span className="text-4xl font-black font-mono text-teal-700 mt-1">
                      {breathCount}
                    </span>
                  )}
                </motion.div>
              </div>

              <button
                onClick={toggleBreathing}
                className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all scale-100 hover:scale-105"
              >
                {isBreathing ? 'Pause Reset' : 'Start Pre-Bed Reset'}
              </button>
            </div>
          )}

          {/* Tool 3: 5-4-3-2-1 Sensory Grounding */}
          {activeTool === 'grounding' && (
            <div className="max-w-2xl mx-auto py-2 space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Acute Exam & Panic De-Escalation
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 mt-2">
                  5-4-3-2-1 Sensory Grounding
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  When acute panic strikes before an exam, presentation, or interview, shift attention from mental loops back to physical reality.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { count: 5, label: '5 things you can SEE', desc: 'Look around right now: notice your textbook font, a tree outside the window, a pen, your shoes, the clock.' },
                  { count: 4, label: '4 things you can physically TOUCH', desc: 'Feel the smooth desk surface, your cotton hoodie, your cool phone back, your feet pressed flat against the floor.' },
                  { count: 3, label: '3 things you can HEAR', desc: 'Listen carefully: the ceiling fan hum, footsteps in the hallway, distant campus traffic.' },
                  { count: 2, label: '2 things you can SMELL', desc: 'Notice the scent of hot coffee, fresh rain, or take a deep sniff of your jacket.' },
                  { count: 1, label: '1 thing you can TASTE', desc: 'Take a sip of cold water, or notice the clean taste in your mouth after swallowing.' }
                ].map(item => (
                  <div key={item.count} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-sm font-mono font-bold flex items-center justify-center flex-shrink-0">
                      {item.count}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool 4: Emergency Helplines Direct Card */}
          {activeTool === 'hotlines' && (
            <div className="max-w-xl mx-auto py-2 space-y-4">
              <div className="text-center mb-6">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Verified Free Helplines
                </span>
                <h3 className="text-xl font-bold font-display text-slate-900 mt-2">
                  Immediate 24/7 Human Support
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confidential, non-judgmental support available day or night.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/40 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Tele-MANAS (Govt. of India)</h4>
                    <p className="text-xs text-slate-500">24/7 Toll-free mental health support across India in multiple languages.</p>
                  </div>
                  <a href="tel:14416" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0">
                    <PhoneCall size={13} />
                    <span>Call 14416</span>
                  </a>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-teal-50/40 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Vandrevala Foundation</h4>
                    <p className="text-xs text-slate-500">Free, confidential mental health counselling via call or WhatsApp.</p>
                  </div>
                  <a href="tel:+919999666555" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0">
                    <PhoneCall size={13} />
                    <span>Call 9999 666 555</span>
                  </a>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-indigo-50/40 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">KIRAN Mental Health Helpline</h4>
                    <p className="text-xs text-slate-500">24/7 dedicated rehabilitation and psychological crisis support.</p>
                  </div>
                  <a href="tel:18005990019" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0">
                    <PhoneCall size={13} />
                    <span>Call 1800-599-0019</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <CrisisSafetyModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </div>
  )
}
