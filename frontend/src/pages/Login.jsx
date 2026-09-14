import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, Brain, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import API from '../api'
import toast from 'react-hot-toast'


export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const nav = useNavigate()

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const { data } = await API.post('/auth/google-login', { token: tokenResponse.access_token || tokenResponse.credential })
                login(data.user, data.access_token)
                toast.success(`Welcome back, ${data.user.full_name}! 🧠`)

                // Conditional Routing
                try {
                    const dashRes = await API.get('/dashboard-data');
                    if (dashRes.data && dashRes.data.severity && dashRes.data.severity.final_severity) {
                        nav('/dashboard');
                    } else {
                        nav('/behaviour');
                    }
                } catch {
                    nav('/behaviour');
                }
            } catch (err) {
                toast.error('Google Login failed')
            }
        },
        onError: () => toast.error('Google Login Failed'),
    })

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await API.post('/auth/login', form)
            login(data.user, data.access_token)
            toast.success(`Welcome back, ${data.user.full_name}! 🧠`)

            // Conditional Routing
            try {
                const dashRes = await API.get('/dashboard-data');
                if (dashRes.data && dashRes.data.severity && dashRes.data.severity.final_severity) {
                    nav('/dashboard');
                } else {
                    nav('/behaviour');
                }
            } catch {
                nav('/behaviour');
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Login failed. Check credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans flex items-center justify-center p-4">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
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
                className="w-full max-w-[440px] relative z-10"
            >
                {/* ── Brand header ─────────────────────────────────── */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3.5 mb-6">
                        {/* Animated Orb */}
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
                                width: 52, height: 52,
                                borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.08) 100%)',
                                border: '1.5px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Brain size={26} className="text-emerald-600" />
                        </motion.div>

                        {/* Stylized Brand Text */}
                        <span style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '30px',
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
                    <h1 className="font-display text-slate-900 font-extrabold text-3xl tracking-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="font-sans text-slate-600 text-sm tracking-normal">
                        Secure access to your MindHealth clinical wellness dashboard.
                    </p>
                </div>

                {/* ── Card ─────────────────────────────────────────── */}
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] rounded-3xl p-8 md:p-10">

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Email Address</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm tracking-wider shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="text-right mt-1">
                                <Link to="/forgot-password" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors font-sans font-medium">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        {/* Sign In button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.99 }}
                            className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all font-display tracking-wider uppercase text-xs shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Authenticating...
                                </>
                            ) : 'Sign In'}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-[1px] bg-slate-200" />
                        <span className="uppercase tracking-widest text-[10px] font-bold text-slate-400">Or</span>
                        <div className="flex-1 h-[1px] bg-slate-200" />
                    </div>

                    {/* Google button */}
                    <motion.button
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(248,250,252,1)' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => googleLogin()}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-sans font-semibold text-sm transition-all shadow-sm"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-1.07 2.978-4.844 2.978-2.921 0-5.4-2.373-5.4-5.4 0-3.026 2.479-5.4 5.4-5.4 1.713 0 2.865.632 3.536 1.244l2.433-2.375C13.9.84 11.665 0 9 0 4.02 0 0 4.024 0 9s4.02 9 9 9c5.16 0 8.44-3.672 8.44-8.8 0-.6-.068-1.058-.16-1.448l-.16-.352z" />
                        </svg>
                        Continue with Google
                    </motion.button>

                    {/* Sign up link */}
                    <p className="text-center mt-7 text-slate-600 text-sm font-sans">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
