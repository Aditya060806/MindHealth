import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneCall, ShieldAlert, Heart, X, ExternalLink, LifeBuoy } from 'lucide-react'

const HELPLINES = [
  {
    name: 'Tele-MANAS (Govt. of India)',
    number: '14416',
    tollFree: '1800-891-4416',
    desc: '24/7 Toll-free mental health support across 20+ Indian languages.',
    badge: 'Official & 24/7',
    color: 'emerald'
  },
  {
    name: 'Vandrevala Foundation',
    number: '+919999666555',
    display: '+91 9999 666 555',
    desc: 'Free, confidential crisis counselling via call or WhatsApp.',
    badge: 'Immediate',
    color: 'teal'
  },
  {
    name: 'KIRAN National Helpline',
    number: '18005990019',
    display: '1800-599-0019',
    desc: '24/7 national mental health rehabilitation support.',
    badge: '24/7 Free',
    color: 'indigo'
  },
  {
    name: '988 Suicide & Crisis Lifeline (US/Intl)',
    number: '988',
    desc: 'Immediate free and confidential support for distress or crisis.',
    badge: 'International',
    color: 'blue'
  }
]

export default function CrisisSafetyModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <LifeBuoy size={22} className="text-white" />
              </div>
              <div>
                <span className="text-xs font-mono font-semibold tracking-wider uppercase text-rose-100">
                  Student Safety & Crisis Support
                </span>
                <h3 className="text-xl font-bold font-display text-white">
                  You Don't Have to Carry This Alone
                </h3>
              </div>
            </div>
            <p className="text-sm text-rose-50/90 leading-relaxed mt-2">
              If college life, academic pressure, or emotional distress feels overwhelming right now, compassionate and confidential human support is immediately available.
            </p>
          </div>

          {/* Calming Breath Prompt */}
          <div className="bg-rose-50/60 border-b border-rose-100/80 px-6 py-3 flex items-center gap-3">
            <Heart size={16} className="text-rose-500 flex-shrink-0 animate-pulse" />
            <p className="text-xs font-medium text-rose-900">
              Take a slow breath in for 4 seconds... hold... and gently exhale. There is zero judgment in reaching out.
            </p>
          </div>

          {/* Hotline Cards */}
          <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto">
            {HELPLINES.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                <a
                  href={`tel:${item.number}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex-shrink-0"
                >
                  <PhoneCall size={14} />
                  <span>Call {item.display || item.number}</span>
                </a>
              </div>
            ))}

            {/* Campus & Local Resource Note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">🏫 Campus Support Note:</p>
              Most colleges and universities provide free, confidential counselling through your campus health center, student wellness cell, or Dean of Student Welfare. Consider reaching out to them during campus hours.
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Free • Confidential • Non-judgmental
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
