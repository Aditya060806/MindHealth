import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mic, StopCircle, RefreshCw, ArrowLeft, Brain } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import API from '../api'
import toast from 'react-hot-toast'
import StepProgress from '../components/StepProgress'

// True PCM WAV Encoder to satisfy backend ML requirements
const interleave = (inputL, inputR) => {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0, inputIndex = 0;
    while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
    }
    return result;
}

const encodeWAV = (samples, format, sampleRate, numChannels, bitDepth) => {
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * bytesPerSample, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * bytesPerSample, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/wav' });
}

const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    let result;
    if (numChannels === 2) {
        result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
        result = buffer.getChannelData(0);
    }
    return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

const RECORD_SECONDS = 15
const STRESS_COLOR = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' }

export default function VoiceAnalysis() {
    const nav = useNavigate()
    const [recording, setRecording] = useState(false)
    const [countdown, setCountdown] = useState(RECORD_SECONDS)
    const [audioBlob, setAudioBlob] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [activeTab, setActiveTab] = useState('live') // 'live' or 'upload'

    // Web Audio API states
    const [audioData, setAudioData] = useState(new Array(24).fill(6))
    const [vocalStatus, setVocalStatus] = useState("Listening...")
    const [statusColor, setStatusColor] = useState("text-slate-400")

    const mediaRecRef = useRef(null)
    const chunksRef = useRef([])
    const authContextRef = useRef(null)
    const analyserRef = useRef(null)
    const animationRef = useRef(null)

    // Cleanup Web Audio handles safely
    const cleanupAudioBlocks = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
        if (authContextRef.current && authContextRef.current.state !== 'closed') {
            authContextRef.current.close().catch(() => { })
        }
        setAudioData(new Array(24).fill(6))
        setVocalStatus("Listening...")
        setStatusColor("text-slate-400")
    }

    React.useEffect(() => {
        return () => cleanupAudioBlocks()
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false,
                    channelCount: 1 // Mono audio is best for Librosa/CNN models
                }
            })
            chunksRef.current = []

            // 1. Setup Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext
            authContextRef.current = new AudioContext()
            analyserRef.current = authContextRef.current.createAnalyser()
            const source = authContextRef.current.createMediaStreamSource(stream)
            source.connect(analyserRef.current)
            analyserRef.current.fftSize = 64 // 32 frequency bins
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

            // 2. Loop & sample Data
            const drawWaveform = () => {
                if (!analyserRef.current) return
                analyserRef.current.getByteFrequencyData(dataArray)

                // Keep 24 items for our 24 bars
                const mappedData = Array.from(dataArray).slice(0, 24).map(val => Math.max(6, (val / 255) * 50))
                setAudioData(mappedData)

                // 3. Vocal Energy Heuristic Calculation
                const avgVolume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
                const percent = (avgVolume / 255) * 100

                if (percent > 60) {
                    setVocalStatus("High Energy / Potential Stress detected...")
                    setStatusColor("text-rose-600")
                } else if (percent > 30) {
                    setVocalStatus("Normal Conversational Tone...")
                    setStatusColor("text-emerald-600")
                } else if (percent > 5) {
                    setVocalStatus("Calm / Quiet Tone...")
                    setStatusColor("text-teal-600")
                } else {
                    setVocalStatus("Listening...")
                    setStatusColor("text-slate-500")
                }

                animationRef.current = requestAnimationFrame(drawWaveform)
            }
            drawWaveform()

            // Original Media Recorder logic
            const mr = new MediaRecorder(stream)
            mr.ondataavailable = e => chunksRef.current.push(e.data)
            mr.onstop = async () => {
                const tempBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                try {
                    const arrayBuffer = await tempBlob.arrayBuffer()
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
                    const wavBlob = audioBufferToWav(audioBuffer)
                    setAudioBlob(wavBlob)
                } catch (err) {
                    console.error("WAV conversion failed", err)
                    setAudioBlob(tempBlob) // fallback
                }
                stream.getTracks().forEach(t => t.stop())
                cleanupAudioBlocks()
            }
            mediaRecRef.current = mr
            mr.start()
            setRecording(true); setCountdown(RECORD_SECONDS)

            let sec = RECORD_SECONDS
            const iv = setInterval(() => {
                sec--; setCountdown(sec)
                if (sec <= 0) { clearInterval(iv); mr.stop(); setRecording(false) }
            }, 1000)
        } catch {
            toast.error('Microphone permission denied')
        }
    }

    const stopRecording = () => {
        mediaRecRef.current?.stop();
        setRecording(false);
    }

    const upload = async () => {
        if (!audioBlob) return
        setLoading(true)
        const fd = new FormData()
        fd.append('audio', audioBlob, 'voice.wav')
        try {
            const { data } = await API.post('/voice/analyse', fd)
            setResult(data)
            toast.success('Voice analysis complete!')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            const arrayBuffer = await file.arrayBuffer()
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

            // Use the existing audioBufferToWav utility to encode it
            const wavBlob = audioBufferToWav(audioBuffer)
            setAudioBlob(wavBlob)
            toast.success("File processed! Click Analyze Voice to detect stress.")
        } catch (err) {
            console.error("Upload error:", err)
            toast.error("Could not process this audio file. Please try a standard MP3 or WAV file.")
        }
    }

    const handleRetry = () => {
        setResult(null)
        setAudioBlob(null)
        setCountdown(RECORD_SECONDS)
        setAudioData(new Array(24).fill(6))
        setVocalStatus("Listening...")
        setStatusColor("text-slate-500")
    }

    return (
        <div
            className="min-h-screen text-slate-800 font-sans selection:bg-emerald-500/20 overflow-x-hidden relative flex flex-col pt-24 pb-12 bg-slate-50"
        >
            {/* Soft ambient lighting */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(5, 150, 105, 0.07) 0%, transparent 65%), radial-gradient(circle at 85% 85%, rgba(13, 148, 136, 0.05) 0%, transparent 55%)',
                }}
            />

            {/* Page content */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl mx-auto z-10 relative flex flex-col items-center space-y-8 px-4"
            >
                    {/* Back button + Step Progress */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* Scaled Branded Header */}
                        <div className="flex items-center justify-center gap-4 mb-2 mt-4 print:hidden w-full">
                            <motion.div
                                animate={{ boxShadow: ['0 0 15px rgba(5,150,105,0.2)', '0 0 30px rgba(5,150,105,0.35)', '0 0 15px rgba(5,150,105,0.2)'] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500 flex items-center justify-center shadow-md flex-shrink-0"
                            >
                                <Brain size={28} className="text-white" />
                            </motion.div>
                            <span className="font-display text-4xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700 bg-clip-text text-transparent">
                                MINDHEALTH
                            </span>
                        </div>
                        <button
                            onClick={() => nav('/face')}
                            className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors text-xs font-bold uppercase tracking-widest w-fit group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Step 3 – Facial Analysis
                        </button>
                        <div className="w-full max-w-4xl mx-auto mb-4 px-4">
                            <StepProgress current={3} />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="text-center space-y-2 w-full">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
                            Voice Stress Analysis
                        </h1>
                        <p className="text-base sm:text-lg font-medium text-slate-500">
                            Step 4/4 — 15-second vocal acoustic evaluation for stress detection
                        </p>
                    </div>

                    {/* ── Signature Glass Card ── */}
                    <div
                        className="w-full h-auto mx-auto flex flex-col overflow-hidden p-6 lg:p-8 bg-white/95 rounded-3xl border border-slate-200/90 shadow-xl"
                    >
                        {!result ? (
                            <div className="space-y-6">
                                {/* Microphone Module */}
                                <div
                                    className={`rounded-2xl p-8 text-center transition-all duration-300 border ${
                                        recording
                                            ? 'bg-rose-50/60 border-rose-300'
                                            : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    {activeTab === 'live' && (
                                        <>
                                            {/* Mic icon with pulse when recording */}
                                            <div className="flex justify-center mb-6">
                                                <div className="relative">
                                                    <motion.div
                                                        className={`w-24 h-24 rounded-full flex items-center justify-center border ${
                                                            recording
                                                                ? 'bg-rose-100 border-rose-400 text-rose-600'
                                                                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                                        }`}
                                                        animate={recording ? {
                                                            scale: [1, 1.08, 1],
                                                            boxShadow: [
                                                                '0 0 0 0 rgba(239,68,68,0.3)',
                                                                '0 0 0 16px rgba(239,68,68,0)',
                                                                '0 0 0 0 rgba(239,68,68,0)'
                                                            ]
                                                        } : {
                                                            boxShadow: '0 4px 16px rgba(5,150,105,0.12)'
                                                        }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                    >
                                                        <Mic size={42} />
                                                    </motion.div>
                                                    {recording && (
                                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full animate-ping block" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Waveform visualizer */}
                                            <div className="flex justify-center gap-1.5 mb-6 h-16 items-end">
                                                {audioData.map((heightVal, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-1.5 rounded-full"
                                                        style={{ background: recording ? '#059669' : '#cbd5e1' }}
                                                        animate={{ height: heightVal }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Countdown & Energy Status */}
                                            {recording && (
                                                <>
                                                    <div className="text-5xl font-extrabold text-rose-600 mb-2 tabular-nums font-mono">{countdown}s</div>
                                                    <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${statusColor} transition-colors duration-300`}>
                                                        {vocalStatus}
                                                    </div>
                                                </>
                                            )}
                                            {!recording && audioBlob && (
                                                <div className="text-emerald-700 font-bold mb-4 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 py-2.5 px-4 rounded-xl w-fit mx-auto">
                                                    <span className="text-lg">✅</span> Recording captured! Ready to analyze.
                                                </div>
                                            )}

                                            {/* Instruction Text */}
                                            <p className="mb-6 text-slate-600 font-medium text-sm sm:text-base">
                                                {recording
                                                    ? '🎙️ Keep speaking clearly. AI is mapping your acoustic energy...'
                                                    : audioBlob
                                                        ? 'Click Analyze to evaluate vocal stress biomarkers'
                                                        : <>
                                                            <span className="text-emerald-700 font-bold">💡 Instruction:</span>{' '}
                                                            Click Start and speak for 15 seconds about your feelings or day.
                                                        </>
                                                }
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 justify-center flex-wrap">
                                                {!recording && !audioBlob && (
                                                    <motion.button
                                                        onClick={startRecording}
                                                        className="btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Mic size={20} /> Start Recording
                                                    </motion.button>
                                                )}
                                                {recording && (
                                                    <motion.button
                                                        onClick={stopRecording}
                                                        className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 transition-colors shadow-md shadow-rose-600/20"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <StopCircle size={20} /> Stop Recording
                                                    </motion.button>
                                                )}
                                                {audioBlob && !recording && (
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            onClick={() => setAudioBlob(null)}
                                                            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                                                        >
                                                            <RefreshCw size={16} /> Re-record
                                                        </button>
                                                        <motion.button
                                                            onClick={upload}
                                                            disabled={loading}
                                                            className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 font-bold"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            {loading
                                                                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing Acoustic Patterns...</>
                                                                : '🔍 Analyze Voice'}
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                {/* Results card */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Vocal Biomarker Analysis</h2>
                                            <p className="text-xs text-slate-500 mt-0.5">Acoustic prosody and frequency distribution</p>
                                        </div>
                                        <span className="text-3xl">🎙️</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                        {[
                                            ['Emotion', result.voice_emotion, '#0d9488'],
                                            ['Mood', result.voice_mood, '#6366f1'],
                                            ['Stress', result.voice_stress, STRESS_COLOR[result.voice_stress] || '#059669'],
                                            ['Severity', `${result.severity_score}/10`, result.severity_score >= 7 ? '#dc2626' : '#d97706'],
                                        ].map(([k, v, c]) => (
                                            <div key={k} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold" style={{ color: c }}>{v}</div>
                                                <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mt-1">{k}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Detailed Sliding Window Counts */}
                                    {result.emotion_counts && Object.keys(result.emotion_counts).length > 0 && (
                                        <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
                                                15s Windowed Acoustic Classification
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(result.emotion_counts)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .map(([emotionLabel, count]) => (
                                                        <div key={emotionLabel} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-xs">
                                                            <span className="text-slate-800 font-medium">{emotionLabel}</span>
                                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">
                                                                {count} {count === 1 ? 'frame' : 'frames'}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        <span>Confidence Level</span>
                                        <span className="font-bold text-slate-800">{(result.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.confidence * 100}%` }}
                                            transition={{ duration: 1.2 }}
                                        />
                                    </div>
                                </div>

                                {/* Stress badge */}
                                <div
                                    className={`p-4 text-center font-bold text-sm rounded-xl border ${
                                        result.voice_stress === 'High'
                                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                                            : result.voice_stress === 'Medium'
                                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    }`}
                                >
                                    🎯 Acoustic Stress Level: {result.voice_stress}
                                </div>

                                <div className="flex gap-4 mt-6 flex-col sm:flex-row">
                                    <motion.button
                                        onClick={handleRetry}
                                        className="w-full py-3.5 text-base flex items-center justify-center gap-2 rounded-xl font-semibold transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <RefreshCw size={18} /> Re-record Audio
                                    </motion.button>

                                    <motion.button
                                        onClick={() => nav('/severity')}
                                        className="btn-primary w-full py-3.5 text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        Continue to Final Severity →
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
    )
}
