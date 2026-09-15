import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API from '../api'
import toast from 'react-hot-toast'
import StepProgress from '../components/StepProgress'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, CheckCircle, Info, Zap, User, ArrowLeft, BarChart2, RefreshCw, Brain } from 'lucide-react'

const BMI_OPTIONS = ['Healthy Weight', 'Overweight', 'Obese']
const GENDER_OPTIONS = ['Male', 'Female']
const OCCUPATION_OPTIONS = ['Accountant', 'Doctor', 'Engineer', 'Lawyer', 'Manager', 'Nurse', 'Sales_person', 'Scientist', 'Software Engineer', 'Student', 'Teacher']

const THEMES = {
    Low: { color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'glow-green', icon: CheckCircle, message: 'Excellent wellness profile! Your habits are contributing to a healthy lifestyle.' },
    Medium: { color: '#F59E0B', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'glow-yellow', icon: Info, message: 'Moderate indicators detected. Small adjustments to your routine could significantly improve your balance.' },
    High: { color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'glow-red', icon: AlertTriangle, message: 'Action required. Your metrics suggest significant physiological or lifestyle stress that needs attention.' }
}

function Slider({ label, name, value, min, max, onChange, colorMap }) {
    const pct = ((value - min) / (max - min)) * 100
    const color = colorMap ? colorMap(pct, value) : '#059669' // dynamic track color
    return (
        <div className="group">
            <div className="flex justify-between mb-2.5 items-center">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">{label}</label>
                <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm transition-all">
                    <span className="text-sm font-black tabular-nums" style={{ color }}>{value}</span>
                </div>
            </div>
            <div className="relative w-full h-4 flex items-center">
                {/* Track background */}
                <div className="absolute left-0 right-0 h-2 bg-slate-200 rounded-full border border-slate-300/40 shadow-inner overflow-hidden">
                    <div className="absolute h-full rounded-full"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
                </div>

                {/* Custom Thumb Glow (Visual only) */}
                <div className="absolute w-5 h-5 rounded-full border-2 pointer-events-none group-hover:scale-110 shadow-md transition-transform"
                    style={{ left: `calc(${pct}% - 10px)`, borderColor: color, backgroundColor: '#ffffff', boxShadow: `0 2px 8px ${color}50`, zIndex: 5 }} />

                {/* Invisible Native Input (The actual interactive element) */}
                <input type="range" min={min} max={max} value={value}
                    onChange={e => onChange(name, parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            </div>
        </div>
    )
}

export default function BehaviourTest() {
    const { user } = useAuth()
    const nav = useNavigate()
    const [userInfo, setUserInfo] = useState(null)
    const [form, setForm] = useState({
        bmi_category: 'Healthy Weight', sleep_hours: 7, sleep_quality: 6,
        physical_activity: 50, stress_level: 5, heart_rate: 72,
        daily_steps: 5000, systolic_bp: 120, diastolic_bp: 80
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [manualMode, setManualMode] = useState(false)
    const [manualInfo, setManualInfo] = useState({
        full_name: '', age: 25, gender: 'Male', occupation: 'Engineer'
    })

    useEffect(() => {
        API.get('/auth/me').then(r => {
            setUserInfo(r.data)
            setManualInfo({
                full_name: r.data.full_name,
                age: r.data.age,
                gender: r.data.gender,
                occupation: r.data.occupation
            })
        }).catch(() => { })
    }, [])

    const updateLabel = (k, v) => setManualInfo(p => ({ ...p, [k]: v }))
    const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

    // Dynamic Slider Colors
    const sleepHoursColor = (pct, val) => val >= 7 ? '#10B981' : val >= 5 ? '#F59E0B' : '#EF4444' // Green -> Yellow -> Red
    const sleepQualityColor = (pct, val) => val >= 7 ? '#10B981' : val >= 4 ? '#F59E0B' : '#EF4444'
    const stressColor = (pct, val) => val <= 3 ? '#10B981' : val <= 7 ? '#F59E0B' : '#EF4444' // Red for high stress

    const handleSubmit = async () => {
        if (loading) return

        // Validation logic
        if (form.physical_activity < 1 || form.physical_activity > 100) {
            toast.error('Physical Activity must be between 1 and 100', { id: 'validation-error' })
            return
        }

        // Additional field validations
        const fields = [
            { name: 'heart_rate', label: 'Heart Rate', min: 40, max: 200 },
            { name: 'daily_steps', label: 'Daily Steps', min: 0, max: 50000 },
            { name: 'systolic_bp', label: 'Systolic BP', min: 70, max: 250 },
            { name: 'diastolic_bp', label: 'Diastolic BP', min: 40, max: 150 }
        ]

        for (const field of fields) {
            if (form[field.name] < field.min || form[field.name] > field.max) {
                toast.error(`${field.label} must be between ${field.min} and ${field.max}`, { id: 'validation-error' })
                return
            }
        }

        setLoading(true)
        const toastId = 'prediction-flow'
        toast.loading('Processing Intelligence Analysis...', { id: toastId })

        try {
            const endpoint = manualMode ? '/behaviour/analyse-manual' : '/behaviour/analyse'
            const payload = manualMode ? { ...form, ...manualInfo } : form

            console.log("Sending Analysis Request:", payload)

            const { data } = await API.post(endpoint, payload)
            setResult(data)
            toast.success('Intelligence Analysis complete!', { id: toastId })
        } catch (err) {
            console.error("Analysis Error:", err)
            const msg = err.response?.data?.detail
            const errorMsg = Array.isArray(msg) ? msg.map(m => `${m.loc.join('.')}: ${m.msg}`).join(', ') : (msg || err.message)
            toast.error(errorMsg || 'Analysis failed', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen py-16 px-4 bg-slate-50 overflow-hidden font-sans">
                {/* Clean Light Background Gradients */}
                <div className="absolute inset-0 z-0 pointer-events-none print:hidden">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%),
                            radial-gradient(ellipse 60% 50% at 100% 50%, rgba(20,184,166,0.06) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 50% at 0% 100%, rgba(226,232,240,0.6) 0%, transparent 70%)
                            `
                        }}
                    />
                </div>

                <div className="w-full max-w-[1000px] mx-auto z-10 relative">
                    {/* Premium Branded Header */}
                    <div className="flex items-center justify-center gap-4 mb-10 mt-2 print:hidden">
                        <motion.div
                            animate={{
                                boxShadow: [
                                    '0 0 16px rgba(16,185,129,0.2)',
                                    '0 0 32px rgba(16,185,129,0.35)',
                                    '0 0 16px rgba(16,185,129,0.2)',
                                ],
                            }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                width: 60, height: 60,
                                borderRadius: 16,
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.08) 100%)',
                                border: '1.5px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Brain size={32} className="text-emerald-600" />
                        </motion.div>
                        <span style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '44px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            background: 'linear-gradient(170deg, #0f172a 20%, #065f46 70%, #059669 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline-block'
                        }}>
                            MINDHEALTH
                        </span>
                    </div>

                    <div className="print:hidden">
                        <StepProgress current={0} />
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <div className="text-center mb-10 print:hidden">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight font-display">Behaviour Analysis</h1>
                            <p className="text-slate-600 text-base font-medium">Step 1/4 — AI-powered mental health behavioural prediction</p>
                        </div>

                        {!result ? (
                            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden mx-auto w-full">
                                {/* Header Section */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 relative z-10">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3 font-display">
                                            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-600">
                                                <User size={20} />
                                            </div>
                                            Personal Metrics
                                        </h2>
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mt-1 font-semibold">Precision parameters for clinical evaluation</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Identity Section */}
                                    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl border transition-all ${manualMode ? 'bg-slate-50 border-emerald-500/30 shadow-sm' : 'bg-slate-50/80 border-slate-200'}`}>
                                        <div className="field-group">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                                            <input type="text" className="bg-transparent border-none text-slate-900 font-bold w-full focus:ring-0 p-0 text-lg tracking-normal"
                                                value={manualMode ? manualInfo.full_name : (userInfo?.full_name || 'Loading...')}
                                                onChange={e => updateLabel('full_name', e.target.value)}
                                                readOnly={!manualMode} />
                                        </div>
                                        <div className="field-group">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Age</label>
                                            <input type="number" className="bg-transparent border-none text-slate-900 font-bold w-full focus:ring-0 p-0 text-lg tracking-normal"
                                                value={manualMode ? manualInfo.age : (userInfo?.age || 0)}
                                                onChange={e => updateLabel('age', parseInt(e.target.value) || '')}
                                                readOnly={!manualMode} />
                                        </div>
                                        <div className="field-group">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Gender</label>
                                            {manualMode ? (
                                                <select className="bg-transparent border-none text-slate-900 font-bold w-full focus:ring-0 p-0 appearance-none text-lg tracking-normal cursor-pointer"
                                                    value={manualInfo.gender} onChange={e => updateLabel('gender', e.target.value)}>
                                                    {GENDER_OPTIONS.map(o => <option key={o} value={o} className="bg-white text-slate-800">{o}</option>)}
                                                </select>
                                            ) : (
                                                <input type="text" className="bg-transparent border-none text-slate-900 font-bold w-full focus:ring-0 p-0 text-lg tracking-normal" value={userInfo?.gender || '...'} readOnly />
                                            )}
                                        </div>
                                        <div className="field-group">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Occupation</label>
                                            {manualMode ? (
                                                <select className="bg-transparent border-none text-slate-900 font-bold w-full focus:ring-0 p-0 appearance-none text-lg tracking-normal cursor-pointer"
                                                    value={manualInfo.occupation} onChange={e => updateLabel('occupation', e.target.value)}>
                                                    {OCCUPATION_OPTIONS.map(o => <option key={o} value={o} className="bg-white text-slate-800">{o}</option>)}
                                                </select>
                                            ) : (
                                                <input type="text" className="bg-transparent border-none text-slate-900 font-bold w-full focus:ring-0 p-0 text-lg tracking-normal" value={userInfo?.occupation || '...'} readOnly />
                                            )}
                                        </div>
                                    </div>

                                    {/* Health & Activity Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="field-group">
                                            <label className="text-slate-800 text-sm font-bold block mb-3 flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                Weight Profile (BMI)
                                            </label>
                                            <div className="flex gap-3">
                                                {BMI_OPTIONS.map(o => (
                                                    <button key={o} onClick={() => update('bmi_category', o)}
                                                        className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${form.bmi_category === o ? 'bg-emerald-50 text-emerald-800 border-emerald-600 shadow-sm ring-1 ring-emerald-500' : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                                        {o}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label className="text-slate-800 text-sm font-bold block mb-3 flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                                                Physical Activity Level (1-100)
                                            </label>
                                            <div className="relative">
                                                <input type="number"
                                                    className={`w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans pr-12 shadow-sm ${(form.physical_activity < 1 || form.physical_activity > 100) ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                                                    value={form.physical_activity} min="1" max="100"
                                                    onChange={e => update('physical_activity', parseInt(e.target.value) || '')}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">%</span>
                                            </div>
                                            {(form.physical_activity < 1 || form.physical_activity > 100) && (
                                                <p className="text-red-500 text-[10px] uppercase font-bold mt-1.5 tracking-wider">⚠️ Must be between 1 and 100</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Lifestyle Sliders */}
                                    <div className="grid grid-cols-1 gap-10 bg-slate-50/80 p-8 rounded-3xl border border-slate-200/80 shadow-sm relative z-10">
                                        <Slider label="Daily Sleep Duration (Hours)" name="sleep_hours" value={form.sleep_hours} min={1} max={12} onChange={update} colorMap={sleepHoursColor} />
                                        <Slider label={`Sleep Quality Assessment Index (1-10)`} name="sleep_quality" value={form.sleep_quality} min={1} max={10} onChange={update} colorMap={sleepQualityColor} />
                                        <Slider label={`Perceived Stress Level Magnitude (1-10)`} name="stress_level" value={form.stress_level} min={1} max={10} onChange={update} colorMap={stressColor} />
                                    </div>

                                    {/* Vital Signs Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                        {[
                                            ['Heart Rate', 'heart_rate', 40, 200, 'BPM'],
                                            ['Daily Steps', 'daily_steps', 0, 50000, 'Steps'],
                                            ['Systolic BP', 'systolic_bp', 70, 250, 'mmHg'],
                                            ['Diastolic BP', 'diastolic_bp', 40, 150, 'mmHg'],
                                        ].map(([label, key, min, max, unit]) => (
                                            <div key={key} className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 text-center transition-all hover:border-emerald-500/40 hover:bg-white hover:shadow-md group">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">{label}</label>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <input type="number" className="bg-transparent border-none text-slate-900 font-black text-3xl w-24 text-center focus:outline-none focus:ring-0 p-0 group-hover:text-emerald-700 transition-colors"
                                                        value={form[key]} min={min} max={max} onChange={e => update(key, parseInt(e.target.value) || '')} />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-4">
                                        <motion.button onClick={handleSubmit} disabled={loading}
                                            className="w-full py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-display text-sm"
                                            whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.99 } : {}}>
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                    Processing Analysis...
                                                </>
                                            ) : <>🧠 Run AI Behaviour Intelligence Analysis <Zap size={18} fill="currentColor" /></>}
                                        </motion.button>
                                        <div className="flex items-center justify-center gap-3 mt-6 opacity-40">
                                            <div className="h-[1px] w-10 bg-slate-300" />
                                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">SECURE CLINICAL AI CORE</p>
                                            <div className="h-[1px] w-10 bg-slate-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 print:block print:bg-white print:shadow-none print:border-none print:m-0 print:p-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                {(() => {
                                    const theme = THEMES[result?.behaviour_risk] || THEMES.Medium
                                    const Icon = theme.icon
                                    return (
                                        <div className={`bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08)] rounded-3xl p-8 ${theme.border} print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid print:p-6`}>
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-2xl ${theme.bg} flex items-center justify-center border ${theme.border}`}>
                                                        <Icon size={32} className={theme.text} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-display font-bold text-slate-900 print:text-black">Prediction: <span className={theme.text}>{result?.behaviour_risk} Risk</span></h2>
                                                        <p className="text-slate-600 text-sm mt-1 print:text-gray-700">{theme.message}</p>
                                                    </div>
                                                </div>
                                                <div className="text-center md:text-right">
                                                    <div className={`text-5xl font-black ${theme.text} leading-tight`}>{result?.severity_score}<span className="text-xl text-slate-400 font-normal print:text-gray-700">/10</span></div>
                                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider print:text-gray-700">Global Severity</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid">
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider print:text-gray-700">
                                                        <span>AI Confidence</span>
                                                        <span className="text-emerald-600 font-black">{result?.confidence?.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden print:bg-gray-200">
                                                        <motion.div className="h-full bg-gradient-to-r from-emerald-600 to-teal-600"
                                                            initial={{ width: 0 }} animate={{ width: `${result?.confidence}%` }} transition={{ duration: 1.5 }} />
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center gap-4 print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600"><User size={14} /></div>
                                                        <span className="text-[11px] text-slate-700 uppercase font-bold tracking-wider print:text-gray-700">User Profile</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 print:text-gray-700">Name</p>
                                                            <p className="font-semibold text-slate-900 text-sm truncate print:text-black">{(manualMode ? manualInfo.full_name : userInfo?.full_name) || "Anonymous"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 print:text-gray-700">Age</p>
                                                            <p className="font-semibold text-slate-900 text-sm print:text-black">{manualMode ? manualInfo.age : userInfo?.age}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 print:text-gray-700">Gender</p>
                                                            <p className="font-semibold text-slate-900 text-sm print:text-black">{manualMode ? manualInfo.gender : userInfo?.gender}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 print:text-gray-700">Occupation</p>
                                                            <p className="font-semibold text-slate-900 text-sm truncate print:text-black">{manualMode ? manualInfo.occupation : userInfo?.occupation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-sm print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid">
                                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider print:text-black"><BarChart2 className="text-emerald-600" size={16} /> Metric Visualization</h3>
                                        <div className="h-[240px] w-full min-w-0">
                                            <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={0}>
                                                <BarChart data={[
                                                    { name: 'Sleep Q', val: form.sleep_quality, max: 10, color: '#059669' },
                                                    { name: 'Stress', val: form.stress_level, max: 10, color: '#D97706' },
                                                    { name: 'Activity', val: form.physical_activity / 10, max: 10, color: '#0D9488' },
                                                    { name: 'Steps', val: form.daily_steps / 1500, max: 10, color: '#6366F1' }
                                                ]} barSize={40}>
                                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                                    <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                                    <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                                                        {[0, 1, 2, 3].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#059669', '#D97706', '#0D9488', '#6366F1'][index]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider print:text-black"><Zap className="text-emerald-600" size={16} /> Key Factors</h3>
                                        {[
                                            { label: 'Stress', val: form.stress_level, threshold: 7, bad: 'High' },
                                            { label: 'Sleep', val: form.sleep_quality, threshold: 4, bad: 'Low', reverse: true },
                                            { label: 'Steps', val: form.daily_steps, threshold: 4000, bad: 'Inactive', reverse: true }
                                        ].map(f => {
                                            const isBad = f.reverse ? f.val <= f.threshold : f.val >= f.threshold
                                            return (
                                                <div key={f.label} className={`p-4 rounded-xl border ${isBad ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50/80'} print:border-gray-200 print:bg-transparent`}>
                                                    <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold tracking-wider">
                                                        <span className="text-slate-500 print:text-gray-700">{f.label}</span>
                                                        <span className={isBad ? 'text-red-600 print:text-red-600' : 'text-emerald-600 print:text-emerald-600'}>{isBad ? 'Alert' : 'Good'}</span>
                                                    </div>
                                                    <p className={`text-sm font-black ${isBad ? 'text-red-700 print:text-red-600' : 'text-slate-900 print:text-black'}`}>{f.val} {isBad ? `(${f.bad})` : ''}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-sm print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid">
                                        <div>
                                            <h3 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider opacity-90 print:text-black">🔍 Prediction Insight</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed print:text-gray-800">
                                                Your pattern indicates a <span className="text-emerald-700 font-bold">{result?.behaviour_risk?.toLowerCase()}</span> risk.
                                                {result?.behaviour_risk === 'High' ? " High stress and poor sleep are the primary triggers. Focus on recovery." :
                                                    result?.behaviour_risk === 'Medium' ? " Metrics are stable but have room for lifestyle optimization." :
                                                        " Habits are well-maintained. Continue your current self-care routine."}
                                            </p>
                                        </div>
                                        <button onClick={() => window.print()} className="w-full py-3 mt-6 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 uppercase border border-slate-200 hover:bg-slate-200 transition-all print:hidden">Export Analysis Report</button>
                                    </div>
                                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/90 shadow-sm print:border print:border-gray-300 print:bg-transparent print:shadow-none print:break-inside-avoid">
                                        <h3 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider opacity-90 print:text-black">💡 AI Recommendations</h3>
                                        <div className="space-y-3">
                                            {result?.recommendations?.slice(0, 3).map((r, i) => (
                                                <div key={i} className="flex gap-3 text-xs text-slate-700 leading-normal p-3 rounded-xl bg-slate-50 border border-slate-200 print:border-gray-200 print:bg-transparent print:text-gray-800">
                                                    <span className="text-emerald-600 text-sm mt-[1px]">✦</span> {r}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-4 flex flex-col sm:flex-row gap-4 print:hidden">
                                    <button onClick={() => setResult(null)} className="flex-[0.6] py-3 md:py-4 text-xs md:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all"><RefreshCw size={16} /> Retake Test</button>
                                    <button onClick={() => nav('/chat')} className="flex-[2] py-4 text-xs md:text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] transition-all">Continue to Counselling <Zap size={16} fill="currentColor" /></button>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
    )
}
