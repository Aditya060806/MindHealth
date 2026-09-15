import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Send, AlertTriangle, CheckCircle, ArrowLeft, Trash2, Zap, Loader2, Brain, Copy, Check, ArrowDown, Square, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import StepProgress from '../components/StepProgress'

export default function ChatCounselling() {
    const { user } = useAuth()
    const nav = useNavigate()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    // Focus state for input inline styling
    const [isFocused, setIsFocused] = useState(false)

    const [loading, setLoading] = useState(false)
    const [emergency, setEmergency] = useState(false)
    const [chatComplete, setChatComplete] = useState(false)
    const bottomRef = useRef(null)
    const chatContainerRef = useRef(null)
    const abortControllerRef = useRef(null)

    const [showScrollTop, setShowScrollTop] = useState(false)
    const [copiedId, setCopiedId] = useState(null)

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollTop(!isNearBottom)
    }

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            setLoading(false)
        }
    }

    const handleInputResize = (e) => {
        e.target.style.height = 'auto'
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    const [analysisResults, setAnalysisResults] = useState(null)
    const [showSummary, setShowSummary] = useState(false)

    useEffect(() => {
        api.get('/api/chat/history').then(r => {
            if (r.data.length > 0) {
                setMessages(r.data.map(m => ({ ...m, id: m.id || Date.now() })))
            } else {
                setMessages([{
                    id: 1, sender: 'bot',
                    message: `Hi ${user?.full_name || 'there'}! 👋 I'm your MindHealth counsellor.\n\nI'm here to listen and help you. **What is your problem?**`,
                    timestamp: new Date().toISOString()
                }])
            }
        }).catch(() => {
            setMessages([{
                id: 1, sender: 'bot',
                message: `Hi ${user?.full_name}! 👋 I'm your MindHealth counsellor. I'm here to listen and help you. What is your problem?`,
                timestamp: new Date().toISOString()
            }])
        })

        // Check if chat is already complete
        api.get('/api/chat/analysis').then(r => {
            if (r.data.stage === 'completed') {
                setChatComplete(true)
            }
        }).catch(() => { })
    }, [user?.full_name])

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const send = async () => {
        if (!input.trim() || loading || showSummary) return

        const userMsg = { id: Date.now(), sender: 'user', message: input.trim(), timestamp: new Date().toISOString() }
        setMessages(p => [...p, userMsg])
        const sentInput = input.trim()
        setInput('')
        setLoading(true)

        // Abort controller logic for stopping the stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        let botMsgId = null;
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const token = localStorage.getItem("mindcare_token") || localStorage.getItem("access_token");

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: sentInput }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Chat API 401 — operating in guest/open-access mode.');
                }
                throw new Error("HTTP Error " + response.status);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            botMsgId = Date.now() + 1;
            setMessages(p => [...p, { id: botMsgId, sender: 'bot', message: '', timestamp: new Date().toISOString() }]);
            setLoading(false);

            let accumulatedReply = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop();

                for (const ev of parts) {
                    if (ev.startsWith('data: ')) {
                        try {
                            const parsed = JSON.parse(ev.substring(6));
                            if (parsed.type === 'chunk') {
                                accumulatedReply += parsed.text;
                                setMessages(p => p.map(m => m.id === botMsgId ? { ...m, message: accumulatedReply } : m));
                            } else if (parsed.type === 'done') {
                                const finalData = parsed.final_data;
                                if (finalData?.emergency) setEmergency(true);
                                if (finalData?.stage === 'completed') setChatComplete(true);
                            }
                        } catch (err) { }
                    }
                }
            }

            if (!accumulatedReply.trim()) {
                throw new Error("Empty response received from AI service");
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Stream stopped by user');
                return;
            }
            console.error("Chat send error:", error)
            toast.error('Failed to send message. Please try again.')

            // Revert optimistic UI on failure and remove empty bot message
            setMessages(p => {
                let filtered = p.filter(m => m.id !== userMsg.id);
                if (botMsgId) {
                    filtered = filtered.filter(m => !(m.id === botMsgId && (!m.message || m.message === '')));
                }
                return [...filtered, { id: Date.now() + 2, sender: 'bot', message: "⚠️ Request failed. Please try again.", timestamp: new Date().toISOString() }];
            });
            setInput(sentInput);
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }


    const finishChat = async () => {
        setLoading(true)
        try {
            const { data } = await api.post('/api/chat/finalize')
            setAnalysisResults(data)
            setShowSummary(true)
            toast.success('Assessment complete!')
        } catch {
            toast.error('Failed to finalize assessment')
        } finally {
            setLoading(false)
        }
    }

    const formatMessage = (text) => text.split('\n').map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine || '&nbsp;' }}
            className={line === '' ? 'mb-1' : 'leading-relaxed'} />
    })

    const resetChat = async () => {
        try {
            const response = await api.delete('/api/chat/clear')
            if (response.data && response.data.success === false) {
                throw new Error("Backend failed to clear chat")
            }

            setMessages([{
                id: Date.now(),
                sender: 'bot',
                message: `Hi ${user?.full_name || 'there'}! 👋 I'm resetting our session to give us a fresh start. What would you like to talk about?`,
                timestamp: new Date().toISOString()
            }])
            setEmergency(false)
            setChatComplete(false)
            setShowSummary(false)
            setAnalysisResults(null)
            toast.success('Chat history cleared')
        } catch (err) {
            console.error("Clear chat error:", err)
            toast.error('Failed to clear chat history')
        }
    }

    const getEmotionEmoji = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('sad') || lower.includes('unhappy') || lower.includes('lonely') || lower.includes('depressed')) return '😢';
        if (lower.includes('happy') || lower.includes('glad') || lower.includes('great') || lower.includes('good')) return '😊';
        if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrat')) return '😠';
        if (lower.includes('anxious') || lower.includes('worry') || lower.includes('scared') || lower.includes('fear')) return '😰';
        return null;
    }

    const SummaryCard = ({ data }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-[950px] mx-auto mt-6 bg-white/95 backdrop-blur-xl p-8 space-y-6 relative overflow-hidden group shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08)] border border-slate-200/90 rounded-3xl"
        >
            <div className="flex items-center gap-4 mb-2 relative z-10">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-600">
                    <Zap size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">AI Assessment Summary</h2>
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mt-1">Based on clinical chat dialogue</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {[
                    { label: 'Problem', value: data.problem },
                    { label: 'Duration', value: data.duration },
                    { label: 'Severity', value: data.severity },
                    { label: 'Sentiment', value: data.sentiment },
                    { label: 'Risk Level', value: data.risk_level || 'Low', color: data.risk_level === 'High' ? 'text-red-600' : data.risk_level === 'Medium' ? 'text-amber-600' : 'text-emerald-600' },
                    { label: 'Triggers', value: data.triggers?.join(', ') || 'None' },
                    { label: 'Impact on Life', value: data.impact_on_daily_life ? 'Yes' : 'No' },
                    { label: 'Emotions', value: data.emotions?.join(', ') || 'Not specified' },
                    { label: 'Physical Symptoms', value: data.physical_symptoms?.join(', ') || 'None reported' },
                    { label: 'Coping Methods', value: data.coping_strategy || 'None identified' },
                    { label: 'Support Available', value: data.support_available ? 'Yes' : 'No' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors group/item">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                        <span className={`text-sm font-bold ${item.color || 'text-slate-900'} group-hover/item:text-emerald-700 transition-colors`}>
                            {item.value || 'N/A'}
                        </span>
                    </div>
                ))}

                {data.additional_notes && data.additional_notes.trim() !== '' && (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-start p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-2">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1.5">Additional Notes</span>
                        <span className="text-sm font-medium text-slate-700 leading-relaxed">
                            {data.additional_notes}
                        </span>
                    </div>
                )}
            </div>

            <div className="pt-4 relative z-10">
                <p className="text-xs text-slate-500 italic mb-6 text-center">
                    "This summary is an AI-generated assessment. Proceed to the next step for multi-modal validation."
                </p>
                <button
                    onClick={() => nav('/face')}
                    className="w-full py-4 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-[0_4px_14px_rgba(5,150,105,0.3)] flex items-center justify-center gap-3 transition-all"
                >
                    <span className="relative z-10 flex items-center gap-2.5">
                        Proceed to Next Step → Face Analysis <CheckCircle size={18} fill="currentColor" />
                    </span>
                </button>
            </div>
        </motion.div>
    )

    return (
        <div className="relative flex flex-col items-center justify-center py-16 px-4 overflow-hidden bg-slate-50 min-h-screen font-sans">
                {/* Clean Light Background Gradients */}
                <div className="absolute inset-0 z-0 pointer-events-none print:hidden">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `
                            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%),
                            radial-gradient(ellipse 60% 50% at 100% 50%, rgba(20,184,166,0.06) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 50% at 0% 100%, rgba(226,232,240,0.6) 0%, transparent 70%)
                            `
                        }}
                        aria-hidden="true"
                    />
                </div>

                {/* Framer Motion Page Entrance */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-5xl mx-auto z-10 relative flex flex-col items-center space-y-8"
                >
                    <div className="flex flex-col gap-6 w-full">
                        <button
                            onClick={() => nav('/behaviour')}
                            className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors text-xs font-bold uppercase tracking-wider w-fit group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Step 1 – Behaviour Analysis
                        </button>
                        {/* Premium Branded Header */}
                        <div className="flex items-center justify-center gap-4 mb-4 mt-2 print:hidden">
                            <motion.div animate={{ boxShadow: ['0 0 16px rgba(16,185,129,0.2)', '0 0 32px rgba(16,185,129,0.35)', '0 0 16px rgba(16,185,129,0.2)'] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(20,184,166,0.08) 100%)', border: '1.5px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Brain size={32} className="text-emerald-600" />
                            </motion.div>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '44px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'linear-gradient(170deg, #0f172a 20%, #065f46 70%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
                                MINDHEALTH
                            </span>
                        </div>
                        <div className="w-full flex justify-center">
                            <StepProgress current={1} />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                            AI Counselling Chat
                        </h1>
                        <p className="text-base font-medium text-slate-600">Step 2/4 — Share your thoughts in a secure, confidential environment</p>
                        <div className="h-px w-24 mx-auto mt-3 bg-slate-200" />
                    </div>

                    {/* The Main Glassmorphic Chat Card */}
                    <div className="w-full max-w-4xl mx-auto h-[78vh] flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)]"
                        style={{ position: 'relative', zIndex: 10 }}>

                        {/* The Chat Header */}
                        <div className="p-5 flex items-center justify-between z-10 relative border-b border-slate-200">
                            <div className="flex flex-col">
                                <h3 className="leading-tight flex items-center gap-2 text-base font-bold text-slate-900 font-display">
                                    AI Counsellor
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} className="animate-pulse" />
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={resetChat}
                                    className="p-2 rounded-xl transition-all text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    title="Reset Chat"
                                >
                                    <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
                                        <Trash2 size={20} />
                                    </motion.div>
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div
                            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-50/50 relative"
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                        >
                            {/* Emergency banner inside chat */}
                            <AnimatePresence>
                                {emergency && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 rounded-2xl border border-dashed border-red-300 bg-red-50/80 shadow-sm"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs uppercase tracking-wider mb-1 text-red-800">Emergency Crisis Support</p>
                                                <p className="text-xs leading-relaxed font-medium text-slate-700">
                                                    If you are in immediate danger, please reach out immediately: <br />
                                                    <span className="font-bold text-red-700">KIRAN: 1800-599-0019</span> | <span className="font-bold text-red-700">iCALL: 9152987821</span>
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex w-full items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mr-3 mt-1 shadow-sm">
                                            <Brain size={16} className="text-emerald-600" />
                                        </div>
                                    )}

                                    <div className={`flex flex-col w-fit max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className="relative group transition-all duration-200"
                                            style={msg.sender === 'user'
                                                ? { background: 'linear-gradient(135deg, #059669, #0d9488)', color: '#ffffff', borderRadius: '16px 0 16px 16px', padding: '14px 18px', fontSize: '14px', fontWeight: 500, boxShadow: '0 4px 14px rgba(5,150,105,0.25)' }
                                                : { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0 16px 16px 16px', color: '#1e293b', padding: '14px 18px', fontSize: '14px', lineHeight: 1.6, fontWeight: 400, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }
                                            }
                                        >
                                            {msg.sender === 'bot' && !loading && msg.message && (
                                                <button
                                                    onClick={() => handleCopy(msg.message, msg.id)}
                                                    className="absolute -right-10 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-emerald-700"
                                                    title="Copy Message"
                                                >
                                                    {copiedId === msg.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                                </button>
                                            )}
                                            <div className="whitespace-pre-wrap">
                                                {msg.message ? (
                                                    formatMessage(msg.message)
                                                ) : (
                                                    msg.sender === 'bot' && (
                                                        <div className="flex gap-1.5 h-6 items-center px-1 py-1">
                                                            {[0, 0.2, 0.4].map(d => (
                                                                <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                                                                    animate={{ y: [0, -4, 0] }}
                                                                    transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                                                            ))}
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {msg.sender === 'user' && getEmotionEmoji(msg.message) && (
                                                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-sm">
                                                    {getEmotionEmoji(msg.message)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] tabular-nums text-slate-400 ${msg.sender === 'user' ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            {msg.sender === 'user' && <CheckCircle size={10} className="text-emerald-600" />}
                                        </div>
                                    </div>

                                    {msg.sender === 'user' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center ml-3 mt-1 shadow-sm">
                                            <span className="text-xs font-bold text-slate-700">{user?.full_name?.charAt(0) || 'U'}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mr-3 mt-1 shadow-sm">
                                        <Brain size={16} className="text-emerald-600" />
                                    </div>
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                        <div className="flex gap-1.5 h-3 items-center">
                                            {[0, 0.2, 0.4].map(d => (
                                                <motion.div key={d} className="w-2 h-2 rounded-full bg-emerald-600"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />

                            {/* Floating Scroll to Bottom Button */}
                            <AnimatePresence>
                                {showScrollTop && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={scrollToBottom}
                                        className="absolute bottom-6 right-8 p-3 rounded-full flex items-center justify-center shadow-md bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:shadow-lg transition-all z-20"
                                    >
                                        <ArrowDown size={18} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* The Input Area */}
                        <div className="px-5 py-4 relative z-10 bg-white border-t border-slate-200 flex items-end gap-3 w-full">
                            <textarea
                                value={input}
                                onChange={e => { setInput(e.target.value); handleInputResize(e); }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Describe how you're feeling today..."
                                className="w-full rounded-xl px-4 py-3 flex-1 outline-none transition-all resize-none custom-scrollbar"
                                style={{
                                    background: '#f8fafc',
                                    border: isFocused ? '1.5px solid #059669' : '1px solid #cbd5e1',
                                    color: '#0f172a',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    minHeight: '50px',
                                    boxShadow: isFocused ? '0 0 0 2px rgba(5,150,105,0.15)' : 'none',
                                    overflowY: 'auto'
                                }}
                                disabled={loading || showSummary}
                                rows={1}
                            />
                            {loading && !showSummary ? (
                                <motion.button
                                    onClick={stopGeneration}
                                    className="p-3.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 bg-red-50 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                                    style={{ height: '50px', width: '50px' }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    title="Stop generating"
                                >
                                    <Square fill="currentColor" size={18} />
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={send}
                                    disabled={!input.trim() || showSummary}
                                    className="p-3.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0"
                                    style={(!input.trim() || showSummary)
                                        ? { background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', height: '50px', width: '50px' }
                                        : { background: 'linear-gradient(135deg, #059669, #0d9488)', color: '#ffffff', boxShadow: '0 4px 14px rgba(5,150,105,0.3)', height: '50px', width: '50px' }
                                    }
                                    whileHover={input.trim() && !showSummary ? { scale: 1.02 } : {}}
                                    whileTap={input.trim() && !showSummary ? { scale: 0.98 } : {}}
                                >
                                    <Send size={18} fill={input.trim() && !showSummary ? "currentColor" : "none"} />
                                </motion.button>
                            )}
                        </div>

                    </div>

                    {/* Bottom Action */}
                    <AnimatePresence>
                        {(messages.length >= 8 || chatComplete) && !showSummary && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex justify-center w-full max-w-4xl pt-2"
                            >
                                <button
                                    onClick={finishChat}
                                    className="w-full max-w-sm py-4 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-2.5">
                                        Done Chatting <Zap size={16} fill="currentColor" />
                                    </span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Summary Card Display */}
                    <AnimatePresence>
                        {showSummary && analysisResults && (
                            <div className="w-full max-w-4xl">
                                <SummaryCard data={analysisResults} />
                            </div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </div>
    )
}
