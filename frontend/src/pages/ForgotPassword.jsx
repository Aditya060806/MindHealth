import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, ArrowLeft, Key, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../api'


export default function ForgotPassword() {
    const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const nav = useNavigate()

    // OTP Countdown Timer
    useEffect(() => {
        let timer;
        if (countdown > 0 && step === 2) {
            timer = setInterval(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown, step]);

    const handleSendOTP = async (e) => {
        e?.preventDefault();
        setLoading(true);
        try {
            // Adjust endpoint as per your backend
            await API.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email!');
            setStep(2);
            setCountdown(60);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to send OTP. Check your email.');
        } finally {
            setLoading(false);
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Adjust endpoint as per your backend
            await API.post('/auth/verify-otp', { email, otp });
            toast.success('OTP Verified!');
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Adjust endpoint as per your backend
            await API.post('/auth/reset-password', { email, newPassword });
            toast.success('Password reset successfully! Please login.');
            nav('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 100% 50%, rgba(20,184,166,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(226,232,240,0.5) 0%, transparent 70%)' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-[440px] relative z-10">

                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3.5 mb-6">
                        <motion.div animate={{ boxShadow: ['0 0 16px rgba(16,185,129,0.2)', '0 0 32px rgba(16,185,129,0.35)', '0 0 16px rgba(16,185,129,0.2)'] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.08) 100%)', border: '1.5px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Brain size={26} className="text-emerald-600" />
                        </motion.div>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '30px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'linear-gradient(170deg, #0f172a 20%, #065f46 70%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
                            MINDHEALTH
                        </span>
                    </div>
                    <h1 className="font-display text-slate-900 font-extrabold text-3xl tracking-tight mb-2">
                        {step === 1 ? 'Reset Password' : step === 2 ? 'Enter OTP' : 'New Password'}
                    </h1>
                    <p className="font-sans text-slate-600 text-sm tracking-normal">
                        {step === 1 ? 'Enter your email to receive a secure recovery code.' : step === 2 ? `We sent a code to ${email}` : 'Secure your account with a new password.'}
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)] rounded-3xl p-8 md:p-10">

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                                    <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-sm shadow-sm" required />
                                </div>
                            </div>
                            <motion.button type="submit" disabled={loading || !email} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }} className="mt-2 w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all font-display tracking-wider uppercase text-xs shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </motion.button>
                        </form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">6-Digit OTP</label>
                                <div className="relative group">
                                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                                    <input type="text" maxLength="6" placeholder="• • • • • •" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 tracking-[0.5em] text-center text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-lg shadow-sm font-semibold" required />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm px-1">
                                <span className="text-slate-600">Didn't receive it?</span>
                                <button type="button" disabled={countdown > 0 || loading} onClick={handleSendOTP} className="text-emerald-600 font-semibold hover:text-emerald-700 disabled:text-slate-400 transition-colors">
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>

                            <motion.button type="submit" disabled={loading || otp.length < 4} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }} className="mt-2 w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all font-display tracking-wider uppercase text-xs shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </motion.button>
                        </form>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="uppercase tracking-wider text-[11px] font-bold text-slate-700 pl-0.5">New Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-4 py-3 pl-11 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans tracking-wider text-sm shadow-sm" required />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <motion.button type="submit" disabled={loading || !newPassword} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }} className="mt-2 w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all font-display tracking-wider uppercase text-xs shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Updating...' : 'Update Password'}
                            </motion.button>
                        </form>
                    )}

                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <button onClick={() => step > 1 ? setStep(step - 1) : nav('/login')} className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-sans text-sm font-semibold">
                            <ArrowLeft size={16} />
                            {step > 1 ? 'Back' : 'Back to Sign In'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
