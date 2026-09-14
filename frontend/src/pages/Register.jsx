import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Brain, User, Mail, Lock, Phone, MapPin, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'


const OCCUPATIONS = ['Accountant', 'Doctor', 'Engineer', 'Lawyer', 'Manager', 'Nurse',
    'Sales_person', 'Scientist', 'Software Engineer', 'Student', 'Teacher']

const steps = ['Personal Info', 'Contact Info', 'Account Setup']

const Err = ({ name, errors }) => errors[name]
    ? <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1 font-sans"><span className="text-[10px]">⚠</span> {errors[name]}</p>
    : null

const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative group">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10" />
        {children}
    </div>
)

export default function Register() {
    const [step, setStep] = useState(0)
    const [form, setForm] = useState({
        full_name: '', age: '', gender: 'Male', occupation: 'Student',
        phone: '', location: '', email: '', password: '', confirm_password: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPwd, setShowPwd] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const nav = useNavigate()

    const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const validateStep = () => {
        const e = {}
        if (step === 0) {
            if (!form.full_name.trim()) e.full_name = 'Full name is required'
            if (!form.age || form.age < 10 || form.age > 100) e.age = 'Age must be 10–100'
        }
        if (step === 1) {
            if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = '10-digit number required'
        }
        if (step === 2) {
            if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
            if (form.password.length < 8) e.password = 'Min 8 characters'
            else if (!/[A-Z]/.test(form.password)) e.password = 'Need an uppercase letter'
            else if (!/[a-z]/.test(form.password)) e.password = 'Need a lowercase letter'
            else if (!/[0-9]/.test(form.password)) e.password = 'Need a number'
            else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Need a special character'

            if (form.password && form.confirm_password && form.password !== form.confirm_password) {
                e.confirm_password = 'Passwords do not match'
            }
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const next = () => { if (validateStep()) setStep(s => s + 1) }
    const back = () => setStep(s => s - 1)

    const handleSubmit = async () => {
        if (!validateStep()) return
        setLoading(true)
        const payload = { ...form, age: parseInt(form.age) }

        try {
            const res = await API.post('/auth/register', payload)
            toast.dismiss()
            toast.success(res.data?.message || 'Registration successful! Taking you to your first assessment.')
            nav('/behaviour')
        } catch (err) {
            toast.dismiss()
            if (!err.response) {
                toast.error('Network error. Is the backend running?')
                return
            }
            const status = err.response.status
            const detail = err.response.data?.detail
            if (status === 422) {
                if (Array.isArray(detail)) {
                    toast.error(`Validation error: ${detail[0]?.msg || 'check fields'}`)
                } else {
                    toast.error('Invalid data format.')
                }
            } else if (status === 400) {
                toast.error(detail || 'Registration failed.')
            } else {
                toast.error('Server error. Please try again later.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans flex items-center justify-center p-4 py-12 md:py-20">
            {/* Background Animations */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        background: `
                        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 50% at 100% 50%, rgba(20,184,166,0.06) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 50% at 0% 100%, rgba(226,232,240,0.5) 0%, transparent 70%)
                        `
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[520px] relative z-10"
            >
                {/* ── Brand / Header ─────────────────────────────────── */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <motion.div
                        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border border-emerald-500/30"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.08) 100%)',
                            boxShadow: '0 0 24px rgba(16,185,129,0.2)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Brain size={32} className="text-emerald-600" />
                    </motion.div>
                    <h1 className="font-display text-slate-900 font-extrabold text-3xl tracking-tight mb-2">
                        Create Account
                    </h1>
                    <p className="font-sans text-slate-600 text-sm tracking-normal">
                        Join MindHealth for personalized clinical mental wellness support.
                    </p>
                </div>

                {/* ── Progress Indicator Tabs UI ──────────────────────── */}
                <div className="mb-8 overflow-x-auto hide-scrollbar">
                    <div className="flex justify-between items-end border-b border-slate-200 min-w-[340px]">
                        {steps.map((s, i) => (
                            <div key={s} className={`flex-1 flex justify-center pb-2.5 border-b-2 transition-all duration-300 ${i === step ? 'border-emerald-600' : 'border-transparent'}`}>
                                <p className={`uppercase tracking-wider text-[10px] font-bold text-center transition-colors ${i === step ? 'text-emerald-700' : (i < step ? 'text-emerald-600/70' : 'text-slate-400')}`}>
                                    {s}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main Form Card ──────────────────────────────────── */}
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] rounded-3xl p-8 md:p-10 mb-6">
                    <div className="min-h-[320px]">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="space-y-5"
                            >
                                {/* Step 0: Personal Info */}
                                {step === 0 && <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Full Name *</label>
                                        <InputWrapper icon={User}>
                                            <input className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm" placeholder="John Doe"
                                                value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                                        </InputWrapper>
                                        <Err name="full_name" errors={errors} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Age *</label>
                                            <input type="number" className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm" placeholder="25"
                                                value={form.age} onChange={e => update('age', e.target.value)} min={10} max={100} />
                                            <Err name="age" errors={errors} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Gender *</label>
                                            <div className="relative group">
                                                <select className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm appearance-none cursor-pointer shadow-sm" value={form.gender}
                                                    onChange={e => update('gender', e.target.value)}>
                                                    <option className="bg-white text-slate-800">Male</option>
                                                    <option className="bg-white text-slate-800">Female</option>
                                                    <option className="bg-white text-slate-800">Other</option>
                                                </select>
                                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Occupation *</label>
                                        <div className="relative group">
                                            <select className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm appearance-none cursor-pointer shadow-sm" value={form.occupation}
                                                onChange={e => update('occupation', e.target.value)}>
                                                {OCCUPATIONS.map(o => <option key={o} className="bg-white text-slate-800">{o}</option>)}
                                            </select>
                                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                        </div>
                                    </div>
                                </>}

                                {/* Step 1: Health Details */}
                                {step === 1 && <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Phone Number <span className="text-slate-400 lowercase font-normal tracking-normal">(optional)</span></label>
                                        <InputWrapper icon={Phone}>
                                            <input className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm" placeholder="9876543210"
                                                value={form.phone} onChange={e => update('phone', e.target.value)} />
                                        </InputWrapper>
                                        <Err name="phone" errors={errors} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Location <span className="text-slate-400 lowercase font-normal tracking-normal">(optional)</span></label>
                                        <InputWrapper icon={MapPin}>
                                            <input className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm" placeholder="City, Country"
                                                value={form.location} onChange={e => update('location', e.target.value)} />
                                        </InputWrapper>
                                    </div>
                                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 mt-2">
                                        <p className="font-sans text-emerald-900 text-xs leading-relaxed flex gap-2">
                                            <Lock size={15} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                                            Your personal data is encrypted and used exclusively for personalized mental health analysis.
                                        </p>
                                    </div>
                                </>}

                                {/* Step 2: Account Setup */}
                                {step === 2 && <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Email Address *</label>
                                        <InputWrapper icon={Mail}>
                                            <input type="email" className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm" placeholder="you@example.com"
                                                value={form.email} onChange={e => update('email', e.target.value)} />
                                        </InputWrapper>
                                        <Err name="email" errors={errors} />
                                    </div>
                                    <div className="flex flex-col gap-1.5 relative">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Password *</label>
                                        <InputWrapper icon={Lock}>
                                            <input type={showPwd ? 'text' : 'password'} className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans tracking-wider text-sm shadow-sm"
                                                placeholder="••••••••"
                                                value={form.password} onChange={e => update('password', e.target.value)} />
                                        </InputWrapper>
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-4 top-[35px] md:top-[38px] text-slate-400 hover:text-slate-700 transition-colors z-20">
                                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <Err name="password" errors={errors} />
                                    </div>
                                    <div className="flex flex-col gap-1.5 relative">
                                        <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Confirm Password *</label>
                                        <InputWrapper icon={Lock}>
                                            <input type={showConfirm ? 'text' : 'password'} className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans tracking-wider text-sm shadow-sm"
                                                placeholder="••••••••"
                                                value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} />
                                        </InputWrapper>
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-[35px] md:top-[38px] text-slate-400 hover:text-slate-700 transition-colors z-20">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <Err name="confirm_password" errors={errors} />
                                    </div>
                                </>}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                        {step > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-sans font-semibold text-sm transition-all"
                                onClick={back}
                            >
                                <ChevronLeft size={16} /> Back
                            </motion.button>
                        )}
                        {step < 2 ? (
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all font-display tracking-wide uppercase text-sm shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)]"
                                onClick={next}
                            >
                                Next Step <ChevronRight size={16} />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.99 }}
                                disabled={loading}
                                className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all font-display tracking-wide uppercase text-sm shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)]"
                                onClick={handleSubmit}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Creating...
                                    </>
                                ) : 'Create Account'}
                            </motion.button>
                        )}
                    </div>
                </div>

                <p className="text-center text-slate-600 text-sm font-sans pb-8">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
