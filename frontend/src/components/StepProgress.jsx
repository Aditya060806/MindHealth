import React from 'react'
import { motion } from 'framer-motion'

const STEPS = [
    { label: 'Behaviour', desc: 'Lifestyle & habits' },
    { label: 'Chat', desc: 'AI counselling' },
    { label: 'Face', desc: 'Expression scan' },
    { label: 'Voice', desc: 'Acoustic analysis' },
]

export default function StepProgress({ current }) {
    return (
        <div className="glass-card-premium px-6 py-4 mb-8 w-full border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between relative max-w-[760px] mx-auto w-full">

                {/* Connecting Track Line */}
                <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-[3px] z-0">
                    {/* Inactive background track */}
                    <div className="absolute inset-0 bg-slate-200/80 rounded-full" />

                    {/* Animated Progress fill */}
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 rounded-full shadow-sm"
                        initial={false}
                        animate={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                </div>

                {STEPS.map((step, i) => {
                    const isCompleted = i < current
                    const isActive = i === current
                    const isUpcoming = i > current

                    return (
                        <div key={step.label} className="relative z-10 flex flex-col items-center group">
                            {/* Step Node Circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.12 : 1,
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                                    isCompleted
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                        : isActive
                                            ? 'bg-emerald-50 border-emerald-600 text-emerald-700 step-active-pulse ring-4 ring-emerald-100/80'
                                            : 'bg-white border-slate-300 text-slate-400'
                                }`}
                            >
                                {isCompleted ? (
                                    <motion.span
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                    >
                                        ✓
                                    </motion.span>
                                ) : (
                                    <span>{i + 1}</span>
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <span
                                className={`mt-2 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-colors duration-300 ${
                                    isActive
                                        ? 'text-emerald-700'
                                        : isCompleted
                                            ? 'text-slate-700'
                                            : 'text-slate-400'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
