import React from 'react'

const STEPS = ['Behaviour', 'Chat', 'Face', 'Voice']

export default function StepProgress({ current }) {
    return (
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl px-6 py-5 mb-10 w-full shadow-sm">
            <div className="flex items-center justify-between relative max-w-[800px] mx-auto w-full">

                {/* Lines Container */}
                <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-[3px] z-0">
                    {/* Background Line */}
                    <div className="absolute inset-0 bg-slate-200 rounded-full" />

                    {/* Active Line (Progress) */}
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-700 ease-in-out shadow-sm rounded-full"
                        style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>

                {STEPS.map((s, i) => (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2.5">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${i < current
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : i === current
                                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 ring-4 ring-emerald-100'
                                    : 'bg-white border-slate-300 text-slate-400'
                                }`}
                        >
                            {i < current ? '✓' : i + 1}
                        </div>
                        <span
                            className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${i <= current ? 'text-emerald-700' : 'text-slate-400'
                                }`}
                        >
                            {s}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
