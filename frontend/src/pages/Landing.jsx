import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Brain, MessageCircle, Camera, Mic, TrendingUp, Shield,
    ArrowRight, CheckCircle2, HeartPulse, Activity,
    Lock, Sparkles, ChevronRight, BarChart3, AlertCircle
} from 'lucide-react'

/* ── Multimodal assessment pillars ────────────────────────────────────────── */
const MODALITIES = [
    {
        icon: Brain,
        title: 'Lifestyle Behaviour AI',
        step: 'Step 01',
        tag: 'Machine Learning',
        description: 'Analyzes sleep duration, physical activity, heart rate, and lifestyle habits to assess underlying physiological stress patterns.',
        metric: '92% Biomarker Accuracy',
        route: '/behaviour',
        color: 'from-emerald-500 to-teal-600',
        bgGlow: 'bg-emerald-500/10'
    },
    {
        icon: MessageCircle,
        title: 'Empathetic AI Counselling',
        step: 'Step 02',
        tag: 'Google Gemini NLP',
        description: 'A conversational clinical intake companion that listens, validates emotions, and extracts structured psychological biomarkers in real-time.',
        metric: 'Adaptive Clinical Intake',
        route: '/chat',
        color: 'from-teal-500 to-cyan-600',
        bgGlow: 'bg-teal-500/10'
    },
    {
        icon: Camera,
        title: 'Facial Expression Scan',
        step: 'Step 03',
        tag: 'Computer Vision CNN',
        description: 'Deep-learning micro-expression telemetry monitoring emotional valence, subtle tension, and affective state during interaction.',
        metric: '7-Class Emotion Fusion',
        route: '/face',
        color: 'from-cyan-500 to-blue-600',
        bgGlow: 'bg-cyan-500/10'
    },
    {
        icon: Mic,
        title: 'Voice Acoustic Telemetry',
        step: 'Step 04',
        tag: 'Spectral Audio Analysis',
        description: 'Extracts acoustic indicators including MFCCs, pitch jitter, and vocal tremor to capture acoustic cues of psychological stress.',
        metric: '18 Acoustic Biomarkers',
        route: '/voice',
        color: 'from-emerald-600 to-teal-700',
        bgGlow: 'bg-emerald-600/10'
    }
]

/* ── Step-by-step workflow ───────────────────────────────────────────────── */
const WORKFLOW = [
    {
        num: '01',
        title: 'Complete Lifestyle Questionnaire',
        desc: 'Input your sleep, activity, and vital signs in under 60 seconds.'
    },
    {
        num: '02',
        title: 'Engage with AI Counsellor',
        desc: 'Share how you feel in an empathetic, confidential chat space.'
    },
    {
        num: '03',
        title: 'Quick Expression & Voice Scan',
        desc: 'Opt to capture brief facial and vocal biomarkers for multi-angle validation.'
    },
    {
        num: '04',
        title: 'Receive Multi-Modal Assessment',
        desc: 'Get your severity score, tailored coping strategies, and personalized wellness plan.'
    }
]

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">

            {/* ━━ NAVBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                            <Brain size={20} />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                            Mind<span className="text-emerald-700">Health</span>
                        </span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#modalities" className="hover:text-emerald-700 transition-colors">Assessment Tech</a>
                        <a href="#workflow" className="hover:text-emerald-700 transition-colors">How It Works</a>
                        <a href="#safety" className="hover:text-emerald-700 transition-colors">Clinical Safety</a>
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="hover:text-emerald-700 transition-colors"
                        >
                            Dashboard
                        </button>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/behaviour')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
                        >
                            <span>Start Assessment</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ━━ HERO SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
                {/* Clean soft ambient glow blobs (pure CSS, no WebGL) */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-100/60 via-teal-100/40 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    
                    {/* Reassuring badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-xs"
                    >
                        <Sparkles size={14} className="text-emerald-600" />
                        <span>Multimodal AI Mental Wellness Platform • No Account Needed</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15] mb-6 max-w-4xl mx-auto"
                    >
                        Holistic Mental Health Insights Powered by{' '}
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                            Multimodal AI
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8"
                    >
                        MindHealth fuses <strong>lifestyle behavioural metrics</strong>, <strong>conversational counseling</strong>, <strong>facial emotion detection</strong>, and <strong>acoustic voice stress analysis</strong> to provide objective, compassionate mental wellness guidance.
                    </motion.p>

                    {/* Call to Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12"
                    >
                        <button
                            onClick={() => navigate('/behaviour')}
                            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 active:scale-95"
                        >
                            <span>Begin Your Assessment</span>
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2"
                        >
                            <BarChart3 size={18} className="text-slate-500" />
                            <span>Explore Dashboard</span>
                        </button>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-6 border-t border-slate-200/80 text-xs font-medium text-slate-500"
                    >
                        <div className="flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                            <span>100% Free & Open Access</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                            <Lock size={16} className="text-emerald-600 flex-shrink-0" />
                            <span>Private & Confidential</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                            <HeartPulse size={16} className="text-emerald-600 flex-shrink-0" />
                            <span>Clinical Triaging Standards</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ━━ MULTIMODAL MODALITIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section id="modalities" className="py-16 bg-white border-y border-slate-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    
                    {/* Section Header */}
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest">Multi-Angle Analysis</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-display">
                            Four Integrated Pillars of Assessment
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base mt-2">
                            Single-modality tests frequently miss subtle signs. MindHealth cross-analyzes multiple behavioral and biological signals to deliver high-fidelity evaluations.
                        </p>
                    </div>

                    {/* Modalities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {MODALITIES.map((item, idx) => {
                            const IconComponent = item.icon
                            return (
                                <div
                                    key={idx}
                                    className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-6 transition-all duration-200 hover:shadow-md hover:border-emerald-300 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform`}>
                                                <IconComponent size={24} />
                                            </div>
                                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700">
                                                {item.tag}
                                            </span>
                                        </div>

                                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{item.step}</span>
                                        <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2 font-display">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">
                                            {item.metric}
                                        </span>
                                        <button
                                            onClick={() => navigate(item.route)}
                                            className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 hover:underline"
                                        >
                                            <span>Launch</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ━━ WORKFLOW (HOW IT WORKS) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section id="workflow" className="py-16 bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <span className="text-emerald-700 font-bold text-xs uppercase tracking-widest">Workflow</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-display">
                            How Your Assessment Works
                        </h2>
                        <p className="text-slate-600 text-sm mt-2">
                            Smooth, intuitive, and designed to take less than 5 minutes total.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {WORKFLOW.map((w, i) => (
                            <div 
                                key={i}
                                className="bg-white border border-slate-200/80 rounded-2xl p-5 relative shadow-xs"
                            >
                                <span className="text-3xl font-black text-emerald-100 font-display block mb-2">
                                    {w.num}
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                                    {w.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {w.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <button
                            onClick={() => navigate('/behaviour')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm shadow-emerald-600/20 inline-flex items-center gap-2 active:scale-95"
                        >
                            <span>Start Step 1: Behaviour Test</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ━━ SAFETY & CLINICAL CARE SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <section id="safety" className="py-14 bg-white border-t border-slate-200/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/30">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 font-display">
                                    Emergency Crisis & Safety Protocol
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                                    If high acute distress is detected during any interaction, MindHealth immediately surfaces crisis support resources and helpline connections.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-emerald-800">
                                    <span>📞 KIRAN Helpline: 1800-599-0019</span>
                                    <span>🚨 Emergency Services: 112</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/behaviour')}
                            className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex-shrink-0"
                        >
                            Begin Assessment
                        </button>
                    </div>
                </div>
            </section>

            {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                            <Brain size={14} />
                        </div>
                        <span className="font-bold text-white text-sm">MindHealth</span>
                        <span className="text-slate-500 ml-2">© {new Date().getFullYear()} All rights reserved.</span>
                    </div>

                    <div className="text-slate-500 text-center sm:text-right max-w-md">
                        MindHealth provides AI-assisted mental wellness insights and is intended for supportive evaluation, not formal psychiatric diagnosis.
                    </div>
                </div>
            </footer>

        </div>
    )
}
