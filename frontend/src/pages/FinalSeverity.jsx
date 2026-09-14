import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, PhoneCall, CheckCircle, ChevronDown, Sparkles, Brain } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import API from '../api'
import toast from 'react-hot-toast'
import StepProgress from '../components/StepProgress'

export default function FinalSeverity() {
    const nav = useNavigate()
    const [data, setData] = useState(null)
    const [loadStage, setLoadStage] = useState(1) // 1 = success, 2 = calculating, 3 = ready to unblock
    const [apiDataReady, setApiDataReady] = useState(false)
    const [emergency, setEmergency] = useState(false)
    const [acknowledged, setAcknowledged] = useState(false)
    const [counter, setCounter] = useState(0)
    const [expandedCard, setExpandedCard] = useState(null)

    useEffect(() => {
        // Stage 1 -> Stage 2 (Show Success for 2.5s)
        const timer1 = setTimeout(() => setLoadStage(2), 2500)
        // Stage 2 -> Stage 3 (Force Processing Spinner for another 2s)
        const timer2 = setTimeout(() => setLoadStage(3), 4500) // 2.5s + 2.0s
        return () => { clearTimeout(timer1); clearTimeout(timer2); }
    }, [])

    useEffect(() => {
        // Parallel API Fetch
        API.get('/final-severity').then(r => {
            setData(r.data);
            setEmergency(r.data.emergency);
            setApiDataReady(true);
            
            // Animate counter
            let n = 0
            const iv = setInterval(() => {
                n = Math.min(n + 0.5, r.data.final_severity)
                setCounter(Math.round(n))
                if (n >= r.data.final_severity) clearInterval(iv)
            }, 80)
        }).catch(() => { 
            setApiDataReady(true);
            toast.error('Failed to calculate severity') 
        })
    }, [])

    const RISK_COLOR = { Low: '#10B981', Moderate: '#F59E0B', High: '#EF4444' }
    const color = data ? RISK_COLOR[data.risk_level] : '#6366F1'

    // Strict Conditional Rendering for the chained loader
    // Stage 1: Show the Green Success Tick for the first 2.5 seconds
    if (loadStage === 1) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <motion.div animate={{ boxShadow: ['0 0 20px rgba(5,150,105,0.2)', '0 0 45px rgba(5,150,105,0.4)', '0 0 20px rgba(5,150,105,0.2)'] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500 flex items-center justify-center shadow-md">
                                <Brain size={28} className="text-white" />
                            </motion.div>
                            <span className="font-display text-3xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
                                MINDHEALTH
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-sm font-semibold tracking-wide">
                                Synthesizing multimodal assessment data...
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Stage 2: Force the Processing Spinner. 
    if (loadStage === 2 || !apiDataReady) {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key="calculating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin shadow-sm" />
                        </div>
                        <p className="text-slate-700 font-semibold tracking-wider uppercase text-xs sm:text-sm font-display">
                            Computing Multimodal Severity Score...
                        </p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden">
            {/* Ambient lighting */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(5, 150, 105, 0.08) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.05) 0%, transparent 60%)',
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-start pt-12 pb-24 px-4 min-h-screen">
                <div className="w-full max-w-3xl mx-auto space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                        {/* Branded Header */}
                        <div className="flex items-center justify-center gap-4 mb-4 mt-2 print:hidden w-full">
                            <motion.div animate={{ boxShadow: ['0 0 15px rgba(5,150,105,0.2)', '0 0 30px rgba(5,150,105,0.35)', '0 0 15px rgba(5,150,105,0.2)'] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500 flex items-center justify-center shadow-md flex-shrink-0">
                                <Brain size={28} className="text-white" />
                            </motion.div>
                            <span className="font-display text-4xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700 bg-clip-text text-transparent">
                                MINDHEALTH
                            </span>
                        </div>
                        <div className="text-center mb-8">
                            <h1 className="font-display tracking-tight text-3xl md:text-5xl font-extrabold text-slate-900 mb-2">
                                Final Clinical Assessment
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base font-medium">Holistic multimodal evaluation combining behavioral, conversational, facial, and acoustic biomarkers.</p>
                        </div>
                    </motion.div>

                    {data && (
                        <div className="space-y-6">
                            {/* User Profile */}
                            {data.user_profile && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-slate-900">{data.user_profile.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600 font-bold border border-slate-200">{data.user_profile.age} YRS</span>
                                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600 font-bold border border-slate-200">{data.user_profile.gender}</span>
                                        </div>
                                    </div>
                                    <div className="md:text-right">
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] uppercase tracking-wider font-bold border border-emerald-200">{data.user_profile.occupation}</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Big gauge */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-white border border-slate-200 rounded-3xl shadow-md relative overflow-hidden p-8 md:p-12 text-center"
                            >
                                <div className="relative inline-block w-56 h-56 mb-6 mt-2">
                                    {/* Circular gauge */}
                                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                        <motion.circle cx="60" cy="60" r="50" fill="none"
                                            stroke={color} strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${(data.final_severity / 10) * 314} 314`}
                                            initial={{ strokeDasharray: '0 314' }}
                                            animate={{ strokeDasharray: `${(data.final_severity / 10) * 314} 314` }}
                                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} 
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-6xl font-extrabold tracking-tighter" style={{ color }}>
                                            {counter}
                                        </span>
                                        <span className="text-slate-400 text-sm font-bold tracking-widest mt-1">/ 10</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase border bg-slate-50"
                                        style={{ borderColor: `${color}40`, color: color }}>
                                        <span className="w-2.5 h-2.5 rounded-full mr-3 animate-pulse" style={{ backgroundColor: color }} />
                                        {data.risk_level} Risk Detected
                                    </div>
                                </div>
                            </motion.div>

                            {/* AI Counsellor Insight (Dynamic Recommendations & Note) */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden p-8"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700">
                                            <Sparkles size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">AI Counsellor Synthesis</h3>
                                    </div>

                                    {data.summary_note && (
                                        <div className="mb-6 p-5 bg-emerald-50/60 border-l-4 border-emerald-500 rounded-r-2xl border-y border-r border-emerald-100">
                                            <p className="text-slate-700 text-base sm:text-lg italic leading-relaxed font-medium">"{data.summary_note}"</p>
                                        </div>
                                    )}

                                    {data.detailed_records && data.detailed_records.recommendations && (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recommended Actions</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(Array.isArray(data.detailed_records.recommendations) 
                                                    ? data.detailed_records.recommendations 
                                                    : typeof data.detailed_records.recommendations === 'string'
                                                        ? (() => {
                                                            try { return JSON.parse(data.detailed_records.recommendations); }
                                                            catch(e) { return data.detailed_records.recommendations.split(/[.-]\s+/).filter(Boolean); }
                                                        })()
                                                        : []
                                                ).map((rec, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition-colors">
                                                        <CheckCircle size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Score breakdown Accordions */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 gap-3.5"
                            >
                                {[
                                    ['🧠 Behaviour Model', data.behaviour_score, 'bg-teal-600', 'behaviour', data.detailed_records?.behaviour],
                                    ['💬 Conversational AI', data.chat_score, 'bg-emerald-600', 'chat', data.detailed_records?.chat],
                                    ['😐 Facial Emotion', data.face_score, 'bg-indigo-600', 'face', data.detailed_records?.face],
                                    ['🎙️ Voice Analysis', data.voice_score, 'bg-amber-600', 'voice', data.detailed_records?.voice]
                                ].map(([label, score, bgClass, key, details]) => {
                                    const isExpanded = expandedCard === key;
                                    return (
                                        <div key={label} className={`bg-white border rounded-2xl shadow-xs relative overflow-hidden transition-all duration-300 ${isExpanded ? 'border-emerald-500/50 shadow-sm' : 'border-slate-200'}`}>
                                            {/* Header */}
                                            <div
                                                className="p-5 cursor-pointer flex items-center justify-between"
                                                onClick={() => setExpandedCard(isExpanded ? null : key)}
                                            >
                                                <div className="flex-1 mr-6">
                                                    <div className="font-bold text-slate-800 mb-2.5 flex items-center justify-between">
                                                        <span className="text-sm sm:text-base">{label}</span>
                                                        <span className="text-slate-700 bg-slate-100 font-bold px-2.5 py-1 rounded-md text-xs border border-slate-200">{score}/10</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full border border-slate-200">
                                                        <motion.div className={`h-full rounded-full ${bgClass}`}
                                                            initial={{ width: 0 }} animate={{ width: `${(score / 10) * 100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
                                                    </div>
                                                </div>
                                                <div className={`p-2 rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-200 text-slate-800' : ''}`}>
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <AnimatePresence>
                                                {isExpanded && details && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-slate-200 bg-slate-50/70 overflow-hidden"
                                                    >
                                                        {Object.keys(details || {}).length > 0 ? (
                                                            <div className="p-6 text-sm text-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-5">
                                                                {Object.entries(details).filter(([k]) => k !== 'recommendations' && k !== 'notes').map(([k, v]) => {
                                                                    let displayValue = v;
                                                                    
                                                                    if (Array.isArray(v)) {
                                                                        displayValue = v.join(', ');
                                                                    } else if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
                                                                        try {
                                                                            const parsed = JSON.parse(v);
                                                                            if (Array.isArray(parsed)) displayValue = parsed.join(', ');
                                                                            else if (typeof parsed === 'object') displayValue = Object.entries(parsed).map(([pk, pv]) => `${pk}: ${pv}`).join(' | ');
                                                                        } catch(e) {}
                                                                    } else if (typeof v === 'object' && v !== null) {
                                                                         displayValue = Object.entries(v).map(([pk, pv]) => `${pk}: ${pv}`).join(' | ');
                                                                    }

                                                                    const colSpan = String(displayValue).length > 40 ? 'col-span-1 md:col-span-2 lg:col-span-3' : '';

                                                                    return (
                                                                        <div key={k} className={`flex flex-col ${colSpan}`}>
                                                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">{k.replace(/_/g, ' ')}</span>
                                                                            {String(displayValue).length > 60 ? (
                                                                                 <span className="block p-3 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed">{displayValue}</span>
                                                                            ) : (
                                                                                 <span className="font-semibold text-slate-800 capitalize">{String(displayValue)}</span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 text-slate-500 text-sm italic text-center">
                                                                Detailed telemetry for this module is currently unavailable.
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </motion.div>

                            {/* Emergency alert */}
                            <AnimatePresence>
                                {emergency && (
                                    <motion.div className="bg-rose-50 border border-rose-300 rounded-2xl p-6 shadow-sm"
                                        initial={{ scale: 0.95, opacity: 0 }} 
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="p-3 bg-rose-100 rounded-xl border border-rose-200 text-rose-700">
                                                <AlertTriangle size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-rose-900 font-bold text-lg tracking-tight">Immediate Professional Support Recommended</h3>
                                                <p className="text-rose-700 text-sm">High risk indicators detected. Please consider reaching out to a certified professional or helpline.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                                            <a href="tel:18005990019" className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 transition-all text-sm text-slate-800 shadow-xs">
                                                <PhoneCall size={18} className="text-rose-600 flex-shrink-0" />
                                                <span>KIRAN <strong className="block text-rose-700 font-mono">1800-599-0019</strong></span>
                                            </a>
                                            <a href="tel:9152987821" className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 transition-all text-sm text-slate-800 shadow-xs">
                                                <PhoneCall size={18} className="text-rose-600 flex-shrink-0" />
                                                <span>iCALL <strong className="block text-rose-700 font-mono">9152987821</strong></span>
                                            </a>
                                            <a href="tel:112" className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 transition-all text-sm text-slate-800 shadow-xs">
                                                <PhoneCall size={18} className="text-rose-600 flex-shrink-0" />
                                                <span>Emergency <strong className="block text-rose-700 font-mono">112</strong></span>
                                            </a>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-rose-100/50 rounded-xl border border-rose-200">
                                            <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)}
                                                className="w-5 h-5 accent-rose-600 rounded" />
                                            <span className="text-sm text-rose-900 font-medium">I understand and will seek professional support if needed</span>
                                        </label>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {data.risk_level === 'Low' && (
                                <motion.div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center shadow-sm"
                                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-700">
                                        <CheckCircle size={28} />
                                    </div>
                                    <h3 className="text-emerald-900 font-bold text-lg mb-1 tracking-tight">Rest & Recovery Optimized</h3>
                                    <p className="text-emerald-800 text-sm">Baseline telemetry indicates low acute stress. Continue maintaining your positive behavioral and sleep routines.</p>
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <motion.button onClick={() => nav('/dashboard')}
                                    disabled={emergency && !acknowledged}
                                    className={`w-full py-4 rounded-xl text-base flex items-center justify-center gap-3 transition-all duration-300 font-bold
                                                ${emergency && !acknowledged 
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                                                    : 'btn-primary shadow-md shadow-emerald-600/20'
                                                }`}
                                    whileHover={emergency && !acknowledged ? {} : { scale: 1.01 }}
                                    whileTap={emergency && !acknowledged ? {} : { scale: 0.98 }}>
                                    {emergency && !acknowledged ? 'Acknowledge Notice to Proceed' : 'Proceed to Patient Dashboard →'}
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
