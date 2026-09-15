import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { CheckCircle, Circle, Send, Loader2, Sparkles, Activity, MessageSquare, Flame, Quote, User, LogOut, Settings, RefreshCw, X, Mail, Phone, MapPin, Book, PlayCircle, Smile, Brain } from 'lucide-react'
import API from '../api'
import toast from 'react-hot-toast'

// ── Hoisted outside Dashboard to prevent remounting on every render ──────────
const getScoreColorClass = (score) => {
    if (score === undefined || score === null) return 'text-slate-400';
    if (score <= 3) return 'text-emerald-400';
    if (score <= 7) return 'text-amber-400';
    return 'text-rose-500';
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg">
                <p className="text-slate-500 text-xs mb-1 font-medium">{label}</p>
                <p className="text-emerald-700 font-bold text-sm">
                    Severity Score: <span className="text-slate-900 text-base">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [suggestions, setSuggestions] = useState(null)
    const [loading, setLoading] = useState(true)

    // Chatbot State
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: "Hello! I am Dr. MindHealth. How are you feeling today?" }
    ])
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // Additional UI State
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState({ full_name: '', email: '', age: '', gender: '', occupation: '', phone: '', location: '' })

    useEffect(() => {
        Promise.all([
            API.get('/dashboard-data'),
            API.get('/smart-suggestions').catch(() => ({ data: { lifestyle: ["Maintain a regular sleep schedule", "Stay socially connected"], quotes: ["Every day is a new beginning."], daily_tasks: [] } }))
        ]).then(([dashRes, sugRes]) => {
            setData(dashRes.data)
            setSuggestions(sugRes.data)
            setEditForm({
                full_name: dashRes.data.user?.full_name || '',
                email: dashRes.data.user?.email || '',
                age: dashRes.data.user?.age || '',
                gender: dashRes.data.user?.gender || '',
                occupation: dashRes.data.user?.occupation || '',
                phone: dashRes.data.user?.phone || '',
                location: dashRes.data.user?.location || ''
            })
            setLoading(false)
        }).catch(err => {
            console.error(err)
            toast.error("Failed to load dashboard")
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        const userMsg = { role: 'user', text: chatInput }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setChatLoading(true)

        try {
            const res = await API.post('/doctor-chat', { message: userMsg.text })
            setChatMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }])
        } catch (err) {
            console.error(err)
            toast.error("Failed to reach AI Doctor")
        } finally {
            setChatLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('mindcare_token')
        localStorage.removeItem('mindcare_user')
        window.location.href = '/login'
    }

    const handleEditSave = async (e) => {
        e.preventDefault()
        try {
            const res = await API.put('/update-profile', {
                full_name: editForm.full_name,
                email: editForm.email,
                age: parseInt(editForm.age) || null,
                gender: editForm.gender,
                occupation: editForm.occupation,
                phone: editForm.phone,
                location: editForm.location
            })
            toast.success("Profile updated!")
            setShowEditModal(false)
            setData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    ...res.data.user
                }
            }))
        } catch (err) {
            toast.error("Failed to update profile")
        }
    }

    const toggleTask = (taskId) => {
        if (!data || !data.daily_tasks) return

        const taskToUpdate = data.daily_tasks.find(t => t.id === taskId)
        if (!taskToUpdate) return
        const updatedCompleted = !taskToUpdate.completed

        const updatedTasks = data.daily_tasks.map(t =>
            t.id === taskId ? { ...t, completed: updatedCompleted } : t
        )
        setData({ ...data, daily_tasks: updatedTasks })

        API.post('/toggle-task', { task_id: taskId, completed: updatedCompleted })
            .catch(err => {
                console.error("Failed to update task", err)
                toast.error("Failed to update task")
                // Revert on failure
                setData(data)
            })
    }

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 mb-4 shadow-sm">
                    <Loader2 size={28} className="text-emerald-700 animate-spin z-10" />
                </div>
                <h2 className="text-slate-900 font-display text-xl font-bold tracking-wider">
                    LOADING <span className="text-emerald-700">DASHBOARD</span>
                </h2>
            </div>
        )
    }

    if (!data) return null

    const score = data.severity?.final_severity || 0
    let color = '#059669' // emerald-600
    if (score >= 4 && score <= 7) color = '#d97706' // amber-600
    if (score > 7) color = '#dc2626' // rose-600

    const radialData = [{ name: 'Severity', value: score, fill: color }]

    const breakdown = {
        behaviour: data.severity?.behaviour_score || 0,
        chat: data.severity?.chat_score || 0,
        face: data.severity?.face_score || 0,
        voice: data.severity?.voice_score || 0
    }

    // --- Daily Tasks Helpers ---
    const getWeekDays = () => {
        const days = [];
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + diffToMonday);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push({
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
                dayNumber: date.getDate(),
                isToday: date.toDateString() === today.toDateString()
            });
        }
        return days;
    };
    const weekDays = getWeekDays();
    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden">
                {/* Soft ambient lighting */}
                <div
                    className="fixed inset-0 z-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(5, 150, 105, 0.08) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.05) 0%, transparent 60%)',
                    }}
                />

                {/* Main Content */}
                <div className="relative z-10 px-4 sm:px-10 xl:px-16 pb-32 max-w-[1600px] w-full mx-auto pt-16 sm:pt-20">

                    {/* Premium Branded Header - Clickable */}
                    <div
                        onClick={() => window.location.href = '/'}
                        className="flex items-center justify-center gap-4 mb-8 sm:mb-12 mt-2 print:hidden w-full cursor-pointer hover:opacity-90 transition-all duration-300"
                        title="Go to Home"
                    >
                        <motion.div animate={{ boxShadow: ['0 0 15px rgba(5,150,105,0.2)', '0 0 30px rgba(5,150,105,0.35)', '0 0 15px rgba(5,150,105,0.2)'] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500 flex items-center justify-center shadow-md flex-shrink-0">
                            <Brain size={28} className="text-white" />
                        </motion.div>
                        <span className="font-display text-4xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700 bg-clip-text text-transparent">
                            MINDHEALTH
                        </span>
                    </div>

                    {/* Welcome / Nav Header */}
                    <div className="flex justify-between items-center mb-8 relative flex-wrap gap-4">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">
                                    Welcome back, {data.user?.full_name?.split(' ')[0] || "Friend"}
                                </h1>
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm sm:text-base font-medium">Your personalized mental wellness telemetry — updated in real time.</p>
                        </motion.div>

                        <div className="flex items-center gap-4">
                            <button onClick={() => window.location.href = '/behaviour'} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full font-bold shadow-md shadow-emerald-600/20">
                                <RefreshCw size={16} /> New Assessment
                            </button>

                            <div className="relative">
                                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-11 h-11 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                                    <User className="text-slate-700" size={20} />
                                </button>

                                {showProfileMenu && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                                            <h3 className="font-bold text-slate-900 truncate">{data.user?.full_name}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{data.user?.age} yrs • {data.user?.occupation || 'No occupation'}</p>
                                        </div>
                                        <div className="p-3 border-b border-slate-100 space-y-2">
                                            {data.user?.email && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail size={14} className="text-emerald-600 shrink-0" />
                                                    <span className="truncate">{data.user.email}</span>
                                                </div>
                                            )}
                                            {data.user?.phone && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Phone size={14} className="text-emerald-600 shrink-0" />
                                                    <span>{data.user.phone}</span>
                                                </div>
                                            )}
                                            {data.user?.gender && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <User size={14} className="text-emerald-600 shrink-0" />
                                                    <span>{data.user.gender}</span>
                                                </div>
                                            )}
                                            {data.user?.location && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <MapPin size={14} className="text-emerald-600 shrink-0" />
                                                    <span className="truncate">{data.user.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <button onClick={() => { setShowProfileMenu(false); setShowEditModal(true); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                                <Settings size={15} /> Edit Profile
                                            </button>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-0.5">
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── MAIN WIDGET GRID ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start relative">

                        {/* LEFT & CENTER COLUMNS */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Section Label */}
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Assessment Summary</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* Top Row: Hero Meter & Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Final Severity Meter */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 flex flex-col items-center justify-center relative transition-all duration-300 hover:shadow-md group"
                                >
                                    <h2 className="text-base font-bold text-slate-800 absolute top-6 left-6 font-display">Current Status</h2>
                                    <div className="absolute top-6 right-6">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold border bg-slate-50"
                                            style={{ color: color, borderColor: `${color}40` }}
                                        >
                                            <span className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: color }} />
                                            {data.severity?.risk_level || "Moderate"} Risk
                                        </span>
                                    </div>

                                    <div className="relative mt-8 w-56 h-56 flex items-center justify-center">
                                        <ResponsiveContainer width={224} height={224} minWidth={0} minHeight={0}>
                                            <RadialBarChart
                                                cx="50%" cy="50%"
                                                innerRadius="70%" outerRadius="100%"
                                                barSize={15} data={radialData}
                                                startAngle={180} endAngle={0}
                                            >
                                                <RadialBar minAngle={15} cornerRadius={10} background={{ fill: '#f1f5f9' }} clockWise dataKey="value" />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute flex flex-col items-center justify-center -translate-y-4">
                                            <span className="text-5xl font-extrabold text-slate-900">{score}</span>
                                            <span className="text-xs text-slate-400 font-bold tracking-widest mt-1">/ 10</span>
                                        </div>
                                    </div>

                                    {/* AI Quick Insight Box */}
                                    <div className="mt-6 w-full p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3 relative z-10">
                                        <Sparkles size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                            Based on your score, a 10-minute mindfulness session is recommended today to maintain mental equilibrium.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Modality Breakdown Grid */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    {[
                                        { label: 'Behaviour', icon: <Activity size={16} />, color: 'emerald', value: breakdown.behaviour },
                                        { label: 'Chat', icon: <MessageSquare size={16} />, color: 'teal', value: breakdown.chat },
                                        { label: 'Facial', icon: <span className="text-sm">😐</span>, color: 'indigo', value: breakdown.face },
                                        { label: 'Voice', icon: <span className="text-sm">🎙️</span>, color: 'amber', value: breakdown.voice },
                                    ].map(({ label, icon, color, value }) => (
                                        <div key={label} className="bg-white border border-slate-200 rounded-3xl shadow-xs p-4 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
                                            <div className="flex items-center gap-2 text-slate-600 mb-3 relative z-10">
                                                {icon}
                                                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                                            </div>
                                            <div className="relative z-10 flex items-end gap-1">
                                                <span className={`text-3xl font-extrabold ${getScoreColorClass(value)}`}>{value}</span>
                                                <span className="text-xs font-semibold text-slate-400 mb-1">/10</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Triggers Banner */}
                                    <div className="col-span-2 bg-rose-50/60 border border-rose-200 rounded-3xl p-4 flex items-start gap-3 overflow-hidden relative shadow-xs">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                                        <Flame size={20} className="text-rose-600 flex-shrink-0 ml-1 mt-0.5" />
                                        <div className="relative z-10 w-full">
                                            <span className="block text-[10px] text-rose-700 font-bold uppercase tracking-widest mb-2">Known Triggers</span>
                                            <div className="flex flex-wrap gap-2">
                                                {data.chat?.triggers ? (
                                                    String(data.chat.triggers).replace(/([A-Z])/g, ' $1').trim().split(',').map((t, i) => (
                                                        <span key={i} className="px-2.5 py-0.5 bg-white border border-rose-200 rounded-full text-xs text-rose-700 font-medium capitalize text-center">
                                                            {t.trim()}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-600 font-medium">None identified</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Historical Trends */}
                            {data.historical_trends && data.historical_trends.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8 relative transition-all duration-300 hover:shadow-md group">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 font-display"><Activity className="text-emerald-600" size={18} /> Progress Over Time</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessment History</span>
                                    </div>

                                    {data.historical_trends.length === 1 && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mb-10">
                                            <div className="bg-white/95 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-full text-xs font-bold tracking-wide shadow-md">
                                                Take more assessments to unlock your progressive telemetry line!
                                            </div>
                                        </div>
                                    )}

                                    <div className="h-64 w-full min-w-0">
                                        <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={0}>
                                            <AreaChart data={data.historical_trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} tickMargin={10} axisLine={false} />
                                                <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDataOverflow={true} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                                <Area type="monotone" dataKey="score" name="Severity" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 7, fill: '#ffffff', stroke: '#059669', strokeWidth: 3 }} dot={{ fill: '#ffffff', stroke: '#059669', strokeWidth: 2, r: 4 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>
                            )}

                            {/* Bottom Row: Suggestions & Tasks */}
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Wellness Tools</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Smart Suggestions */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 font-display"><Sparkles className="text-emerald-600" size={18} /> Clinical Insights</h3>
                                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 space-y-3 relative min-h-[150px]">
                                        {!suggestions ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                <Loader2 className="animate-spin mb-2 text-emerald-600" size={24} />
                                                <span className="text-xs tracking-wider uppercase font-semibold">Generating Insights...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {suggestions.lifestyle?.map((sug) => (
                                                    <div key={sug} className="flex gap-3 text-slate-700 text-xs sm:text-sm bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors p-3.5 rounded-2xl relative z-10">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                                                        <span className="leading-relaxed">{sug}</span>
                                                    </div>
                                                ))}
                                                {suggestions.quotes?.[0] ? (
                                                    <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3 text-emerald-900/90 italic text-xs sm:text-sm relative z-10">
                                                        <Quote size={18} className="flex-shrink-0 text-emerald-600" />
                                                        <span className="leading-relaxed font-medium">"{suggestions.quotes[0]}"</span>
                                                    </div>
                                                ) : suggestions.quote && (
                                                    <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3 text-emerald-900/90 italic text-xs sm:text-sm relative z-10">
                                                        <Quote size={18} className="flex-shrink-0 text-emerald-600" />
                                                        <span className="leading-relaxed font-medium">"{suggestions.quote}"</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Quick Mood Check-in */}
                                    <div className="mt-6 space-y-3">
                                        <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 font-display"><Smile className="text-emerald-600" size={18} /> Quick Check-in</h3>
                                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col justify-center">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">How are you feeling right now?</p>
                                            <div className="flex justify-between items-center">
                                                {['😫', '😟', '😐', '🙂', '🤩'].map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => toast.success('Mood logged successfully!')}
                                                        className="w-11 h-11 flex items-center justify-center text-2xl bg-slate-50 border border-slate-200 rounded-full hover:scale-110 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Daily Tasks */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">

                                    {/* Widget header */}
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 font-display">
                                            <CheckCircle className="text-emerald-600" size={18} />
                                            Daily Tasks
                                        </h3>
                                        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{currentMonthYear}</span>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-3 mb-3">
                                        <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                                            {weekDays.map((d, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all ${d.isToday
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span className={`text-[10px] font-bold tracking-wider ${d.isToday ? 'text-white/80' : 'text-slate-400'}`}>{d.dayName}</span>
                                                    <span className="text-lg font-bold mt-0.5">{d.dayNumber}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-7">
                                        {/* Progress bar */}
                                        {data.daily_tasks?.length > 0 && (() => {
                                            const done = data.daily_tasks.filter(t => t.completed).length
                                            const pct = Math.round((done / data.daily_tasks.length) * 100)
                                            return (
                                                <div className="mb-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs text-slate-500 font-medium">{done} of {data.daily_tasks.length} completed</span>
                                                        <span className="text-xs font-bold text-emerald-700">{pct}%</span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                                            className="h-full rounded-full bg-emerald-600"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        {/* Timeline items */}
                                        <div className="relative">
                                            {/* Continuous left line */}
                                            <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-emerald-500/40 via-slate-700/60 to-transparent" />

                                            <div className="space-y-3">
                                                {data.daily_tasks?.map((task, idx) => (
                                                    <motion.div
                                                        key={task.id}
                                                        layout
                                                        className="flex items-start gap-4"
                                                    >
                                                        {/* Node on the line */}
                                                        <div className="relative flex-shrink-0 z-10 mt-3.5">
                                                            <motion.button
                                                                whileTap={{ scale: 0.85 }}
                                                                onClick={() => toggleTask(task.id)}
                                                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${task.completed
                                                                    ? 'border-emerald-500 bg-emerald-100 shadow-xs'
                                                                    : 'border-slate-300 bg-white hover:border-emerald-400'
                                                                    }`}
                                                            >
                                                                {task.completed
                                                                    ? <CheckCircle size={17} className="text-emerald-700" />
                                                                    : <Circle size={17} className="text-slate-400" />
                                                                }
                                                            </motion.button>
                                                        </div>

                                                        {/* Task card */}
                                                        <motion.div
                                                            onClick={() => toggleTask(task.id)}
                                                            whileHover={{ x: 2 }}
                                                            transition={{ duration: 0.15 }}
                                                            className={`flex-1 cursor-pointer p-4 rounded-2xl border transition-all duration-300 shadow-xs ${task.completed
                                                                ? 'bg-emerald-50/70 border-emerald-200'
                                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <span className={`text-xs sm:text-sm font-medium leading-snug transition-colors ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                                                    }`}>
                                                                    {task.task}
                                                                </span>
                                                                {task.completed && (
                                                                    <motion.span
                                                                        initial={{ scale: 0, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex-shrink-0 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200"
                                                                    >
                                                                        Done ✓
                                                                    </motion.span>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: AI Doctor Chatbot & SOS */}
                        <div className="sticky top-28 z-20 flex flex-col gap-5">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">AI Support</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                                className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px] lg:h-[calc(100vh-14rem)] lg:max-h-[650px] transition-all duration-300 hover:shadow-md"
                            >
                                {/* Chat Header */}
                                <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3.5 relative z-10">
                                    <div className="relative">
                                        <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xl shadow-xs">👨‍⚕️</div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base font-display">Dr. MindHealth</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                            <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">AI Therapist Active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar relative z-10">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[85%] p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant'
                                                ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                                                : 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-xs bg-slate-100 border border-slate-200">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Chat Input */}
                                <div className="p-3.5 bg-slate-50 border-t border-slate-200 relative z-10">
                                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Type your message..."
                                            disabled={chatLoading}
                                            className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!chatInput.trim() || chatLoading}
                                            className="absolute right-1.5 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>

                            {/* Quick Support & SOS */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 flex justify-between items-center gap-3"
                            >
                                <a href="tel:18005990019" className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold tracking-wide text-xs transition-all flex items-center justify-center gap-2 shadow-xs">
                                    <Phone size={15} /> Helpline
                                </a>
                                <button onClick={() => toast.success('Journal module opening soon...')} className="flex-1 py-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl font-bold tracking-wide text-xs transition-all flex items-center justify-center gap-2 shadow-xs">
                                    <Book size={15} /> Log Journal
                                </button>
                            </motion.div>

                            {/* Breathing Zone */}
                            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 text-center relative overflow-hidden group">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Mindfulness</span>
                                <h4 className="text-slate-800 font-bold text-sm mb-1 font-display">1-Minute Reset</h4>
                                <p className="text-xs text-slate-500 mb-5">Sync your breath with the expanding circle</p>

                                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                    <div className="absolute inset-0 border-2 border-emerald-200 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                    <div className="absolute inset-2 border-2 border-teal-200 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />

                                    <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-md animate-[pulse_4s_ease-in-out_infinite] flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Breathe</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recommended Videos */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800"><PlayCircle className="text-emerald-600" size={16} /> Recommended Resources</h3>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>

                                {/* Video 1 */}
                                <a
                                    href="https://www.youtube.com/watch?v=inpok4MKVLM"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white border border-slate-200 rounded-2xl p-2.5 flex gap-3.5 items-center hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
                                >
                                    <div className="w-24 h-14 rounded-xl relative flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                                        <img
                                            src="https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg"
                                            alt="Meditation Thumbnail"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <PlayCircle size={22} className="text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">5-Minute Meditation You Can Do Anywhere</h4>
                                        <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">{data.severity?.risk_level || "Moderate"} Risk Suggestion</p>
                                    </div>
                                </a>

                                {/* Video 2 */}
                                <a
                                    href="https://www.youtube.com/watch?v=O-6f5wQXSu8"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white border border-slate-200 rounded-2xl p-2.5 flex gap-3.5 items-center hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
                                >
                                    <div className="w-24 h-14 rounded-xl relative flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                                        <img
                                            src="https://img.youtube.com/vi/O-6f5wQXSu8/hqdefault.jpg"
                                            alt="Anxiety Relief Thumbnail"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <PlayCircle size={22} className="text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">10-Minute Relief from Stress & Anxiety</h4>
                                        <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">{data.severity?.risk_level || "Moderate"} Risk Suggestion</p>
                                    </div>
                                </a>

                                {/* Video 3 */}
                                <a
                                    href="https://www.youtube.com/watch?v=b1H3xO3x_Js"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white border border-slate-200 rounded-2xl p-2.5 flex gap-3.5 items-center hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group"
                                >
                                    <div className="w-24 h-14 rounded-xl relative flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                                        <img
                                            src="https://img.youtube.com/vi/b1H3xO3x_Js/hqdefault.jpg"
                                            alt="Yoga for Stress Thumbnail"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <PlayCircle size={22} className="text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">15-Minute Relaxing Yoga for Stress</h4>
                                        <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">{data.severity?.risk_level || "Moderate"} Risk Suggestion</p>
                                    </div>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
                {/* End Main Content wrapper */}

                {/* Edit Profile Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"><X size={22} /></button>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">Edit Profile</h2>
                            <form onSubmit={handleEditSave} className="space-y-4">
                                <div>
                                    <label htmlFor="edit-fullname" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                                    <input id="edit-fullname" type="text" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm" required />
                                </div>
                                <div>
                                    <label htmlFor="edit-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email</label>
                                    <input id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-age" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Age</label>
                                        <input id="edit-age" type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm" required />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-gender" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Gender</label>
                                        <select id="edit-gender" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm" required>
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="edit-occupation" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Occupation</label>
                                    <select
                                        id="edit-occupation"
                                        value={editForm.occupation}
                                        onChange={e => setEditForm({ ...editForm, occupation: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm"
                                        required
                                    >
                                        <option value="" disabled>Select Occupation</option>
                                        <option value="Accountant">Accountant</option>
                                        <option value="Doctor">Doctor</option>
                                        <option value="Engineer">Engineer</option>
                                        <option value="Lawyer">Lawyer</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Nurse">Nurse</option>
                                        <option value="Sales_person">Sales_person</option>
                                        <option value="Scientist">Scientist</option>
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Student">Student</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="edit-phone" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone</label>
                                        <input id="edit-phone" type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-location" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Location</label>
                                        <input id="edit-location" type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white text-sm" />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-semibold text-sm">Cancel</button>
                                    <button type="submit" className="btn-primary flex-1 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
    )
}
