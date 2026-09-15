import React, { useState, useRef, useEffect } from 'react'
import * as faceapi from '@vladmandic/face-api'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Camera, StopCircle, Upload, RefreshCw, Brain, Activity, ScanFace, ArrowLeft } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import API from '../api'
import toast from 'react-hot-toast'
import StepProgress from '../components/StepProgress'

const EMOTION_COLORS = {
    Happy: '#10B981', Neutral: '#6366F1', Sad: '#3B82F6',
    Angry: '#EF4444', Surprise: '#F59E0B', Fear: '#8B5CF6', Disgust: '#EC4899'
}

const EMOTION_EMOJI = { Happy: '😊', Sad: '😢', Angry: '😠', Fear: '😨', Surprise: '😲', Neutral: '😐', Disgust: '🤢' }
const INSIGHT_TEXTS = {
    Happy: 'Looking great! Detected a smile.',
    Neutral: 'You appear calm and balanced.',
    Sad: 'Sensing some low energy or sadness.',
    Angry: 'You appear upset or frustrated.',
    Surprise: 'You look surprised by something!',
    Fear: 'Detected signs of anxiety or fear.',
    Disgust: 'Sensing discomfort or disgust.'
}
const RECORD_SECONDS = 20

export default function FaceEmotion() {
    const nav = useNavigate()
    const videoRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const isRecordingRef = useRef(false)
    const emotionCountsRef = useRef({ Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 })

    const [recording, setRecording] = useState(false)
    const [liveCounts, setLiveCounts] = useState({ Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 })
    const [dominantEmotion, setDominantEmotion] = useState(null)
    const [floatingEmojis, setFloatingEmojis] = useState([])
    const [countdown, setCountdown] = useState(RECORD_SECONDS)
    const [videoBlob, setVideoBlob] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [stream, setStream] = useState(null)
    const [permission, setPermission] = useState(false)
    const canvasRef = useRef(null)
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [liveScores, setLiveScores] = useState({
        Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0
    })
    const liveScoresRef = useRef({ Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 })

    // REF FOR DECOUPLING UI FROM FACEAPI
    const latestDetectedRef = useRef({
        dominantCapKey: null,
        scoreMap: { Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 },
        highestScore: 0
    })

    const [timelineData, setTimelineData] = useState([])

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ])
                setModelsLoaded(true)
            } catch (err) {
                console.error("Failed to load face-api models", err)
                toast.error("Failed to load local face tracking models.")
            }
        }
        loadModels()
    }, [])

    // UI UPDATE INTERVAL (Throttles React re-renders)
    useEffect(() => {
        const uiInterval = setInterval(() => {
            if (!stream && !recording) return;

            const { dominantCapKey, scoreMap, highestScore } = latestDetectedRef.current;

            if (dominantCapKey) {
                setDominantEmotion(dominantCapKey);
                setLiveScores(scoreMap);

                if (isRecordingRef.current) {
                    setLiveCounts({ ...emotionCountsRef.current });

                    // Spawn floating emoji if confidence is super high (>85%) AND recording
                    if (highestScore > 0.85 && Math.random() > 0.5) {
                        const newEmoji = {
                            id: Date.now() + Math.random(),
                            emotion: dominantCapKey,
                            left: `${20 + Math.random() * 60}%`, // random horizontal position
                            size: 20 + Math.random() * 20
                        }
                        setFloatingEmojis(prev => [...prev.slice(-10), newEmoji])
                    }
                }
            } else {
                setLiveScores({ Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 });
            }
        }, 800)

        return () => clearInterval(uiInterval)
    }, [stream, recording])

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream, permission])

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    const requestCamera = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(s)
            setPermission(true)
        } catch {
            toast.error('Camera permission denied. Please allow camera access.')
        }
    }

    const startRecording = () => {
        chunksRef.current = []
        emotionCountsRef.current = { Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 }
        setLiveCounts(emotionCountsRef.current)
        setTimelineData([])

        const mr = new MediaRecorder(stream, { mimeType: 'video/webm' })
        mr.ondataavailable = e => chunksRef.current.push(e.data)
        mr.onstop = () => setVideoBlob(new Blob(chunksRef.current, { type: 'video/webm' }))
        mediaRecorderRef.current = mr
        mr.start()

        setRecording(true)
        isRecordingRef.current = true
        setCountdown(RECORD_SECONDS)

        let sec = RECORD_SECONDS
        const iv = setInterval(() => {
            sec--; setCountdown(sec)

            setTimelineData(prev => {
                const newData = [...prev, { time: `${RECORD_SECONDS - sec}s`, ...liveScoresRef.current }]
                // Keep the last 20 seconds, although the recording is 20s anyway
                return newData;
            })

            if (sec <= 0) {
                clearInterval(iv);
                mr.stop();
                setRecording(false);
                isRecordingRef.current = false;
            }
        }, 1000)
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
        isRecordingRef.current = false;
    }

    const handleRetry = async () => {
        setResult(null);
        setVideoBlob(null);
        setTimelineData([]);
        setLiveCounts({ Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 });
        if (stream) stream.getTracks().forEach(t => t.stop());
        await requestCamera();
    };

    const uploadAndAnalyze = async () => {
        if (!videoBlob) return
        setLoading(true)
        const formData = new FormData()
        formData.append('video', videoBlob, 'face_recording.webm')
        // Send the live collected frame counts to override backend ML
        formData.append('live_counts', JSON.stringify(liveCounts))
        try {
            const { data } = await API.post('/face/analyse', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            setResult(data)
            stream?.getTracks().forEach(t => t.stop())
            toast.success('Facial analysis complete!')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed')
        } finally {
            setLoading(false)
        }
    }

    const SEVERITY_COLOR = (s) => s <= 3 ? '#10B981' : s <= 6 ? '#F59E0B' : '#EF4444'
    const pieData = result
        ? Object.entries(result.emotion_distribution || {}).map(([k, v]) => ({ name: k, value: v }))
        : []

    // Helper: Determine Compound Emotion
    const getComplexEmotion = () => {
        const { Sad, Fear, Angry, Disgust, Happy, Surprise } = liveCounts;
        if (Sad > 0 && Fear > 0) return "Anxiety / Distress";
        if (Angry > 0 && Disgust > 0) return "Frustration / Contempt";
        if (Happy > 0 && Surprise > 0) return "Excitement / Awe";
        return "Focused / Singular Emotion";
    };

    // Helper: Calculate Emotional Volatility
    const calculateVolatility = () => {
        let changes = 0;
        let lastDominant = null;
        timelineData.forEach(data => {
            let dominant = null;
            let maxScore = -1;
            ['Happy', 'Neutral', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'].forEach(emp => {
                if (data[emp] > maxScore) {
                    maxScore = data[emp];
                    dominant = emp;
                }
            });
            if (lastDominant && dominant !== lastDominant) {
                changes++;
            }
            lastDominant = dominant;
        });
        if (changes > 5) return "High (Rapid mood shifts detected)";
        if (changes >= 2 && changes <= 5) return "Moderate (Normal emotional flow)";
        return "Stable (Consistent emotional state)";
    };

    return (
        <div className="min-h-screen text-slate-800 font-sans selection:bg-emerald-500/20 overflow-x-hidden relative flex flex-col pt-24 pb-12 bg-slate-50">
                <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
                    style={{
                        background: `
                        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 50% at 100% 50%, rgba(20,184,166,0.06) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 50% at 0% 100%, rgba(226,232,240,0.6) 0%, transparent 70%)
                        `,
                        opacity: stream ? 0.3 : 1
                    }} />

                {/* Page Entrance */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-5xl mx-auto z-10 relative flex flex-col items-center space-y-8"
                >
                    <div className="flex flex-col gap-6 w-full">
                        <button
                            onClick={() => nav('/chat')}
                            className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors text-xs font-bold uppercase tracking-wider w-fit group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Step 2 – Chat Analysis
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
                            <StepProgress current={3} />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                            Face Emotion Analysis
                        </h1>
                        <p className="text-base font-medium text-slate-600">Step 3/4 — Record a 20-second video for AI emotion telemetry</p>
                        <div className="h-px w-24 mx-auto mt-3 bg-slate-200" />
                    </div>

                    <div className="w-full h-auto mx-auto flex flex-col overflow-hidden p-6 lg:p-8 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_rgba(15,23,42,0.03)]"
                        style={{ position: 'relative', zIndex: 10 }}>

                        {!result ? (
                            <>
                                <div className={`w-full flex flex-col gap-8 ${recording || videoBlob ? 'lg:grid lg:grid-cols-12 lg:gap-8 items-stretch' : 'items-center'}`}>
                                    {/* Left Column */}
                                    <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                                        <div className="aspect-[4/3] w-full bg-slate-900 border border-slate-200 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center" style={{ willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                                            {!permission ? (
                                                <div className="flex flex-col items-center justify-center gap-4 relative z-20 w-full h-full p-8 text-center">
                                                     <Camera size={48} className="text-slate-400" />
                                                     <button onClick={requestCamera}
                                                         className="px-8 py-3.5 rounded-xl transition-all font-bold uppercase text-xs tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)]"
                                                     >
                                                         📷 Enable Camera
                                                     </button>
                                                     <p className="text-slate-500 text-xs">Camera access is required for real-time facial emotion assessment</p>
                                                 </div>
                                             ) : (
                                                 <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ willChange: 'transform', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                                                     <video ref={videoRef} autoPlay muted playsInline
                                                         className="w-full h-full object-cover"
                                                         style={{ transform: 'scaleX(-1) translateZ(0)', willChange: 'transform', backfaceVisibility: 'hidden' }}
                                                         onPlay={() => {
                                                             const canvas = canvasRef.current;
                                                             const video = videoRef.current;
                                                             let tick = 0;
                                                             const interval = setInterval(async () => {
                                                                 if (!video || !canvas || video.paused || video.ended) {
                                                                     clearInterval(interval);
                                                                     return;
                                                                 }

                                                                 // Only perform face tracking if models are successfully loaded and video has frames
                                                                 if (modelsLoaded && video.readyState === 4) {
                                                                     const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()

                                                                     // Update canvas dimensions dynamically to match video layout
                                                                     const displaySize = { width: video.clientWidth, height: video.clientHeight }
                                                                     faceapi.matchDimensions(canvas, displaySize)

                                                                     if (detections) {
                                                                         const resizedDetections = faceapi.resizeResults(detections, displaySize)

                                                                         // Clear previous drawings
                                                                         const ctx = canvas.getContext('2d')
                                                                         ctx.clearRect(0, 0, canvas.width, canvas.height)

                                                                         // Calculate highest expression
                                                                         const sortedExpressions = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1])
                                                                         const [highestEmotion, highestScore] = sortedExpressions[0]
                                                                         let dominantCapKey = highestEmotion.charAt(0).toUpperCase() + highestEmotion.slice(1)
                                                                         if (dominantCapKey === 'Surprised') dominantCapKey = 'Surprise'
                                                                         if (dominantCapKey === 'Fearful') dominantCapKey = 'Fear'
                                                                         if (dominantCapKey === 'Disgusted') dominantCapKey = 'Disgust'

                                                                         // Count dominating emotion if recording is active
                                                                         if (isRecordingRef.current) {
                                                                             emotionCountsRef.current[dominantCapKey] += 1
                                                                         }

                                                                         // update React State for the Live Graph UI below
                                                                         const scoreMap = { Happy: 0, Neutral: 0, Sad: 0, Angry: 0, Surprise: 0, Fear: 0, Disgust: 0 }
                                                                         Object.entries(detections.expressions).forEach(([k, v]) => {
                                                                             let capKey = k.charAt(0).toUpperCase() + k.slice(1)
                                                                             if (capKey === 'Surprised') capKey = 'Surprise'
                                                                             if (capKey === 'Fearful') capKey = 'Fear'
                                                                             if (capKey === 'Disgusted') capKey = 'Disgust'
                                                                             if (scoreMap[capKey] !== undefined) scoreMap[capKey] = (v * 100).toFixed(1)
                                                                         })
                                                                         liveScoresRef.current = scoreMap

                                                                         // Write to refs ONLY. Do not trigger setState.
                                                                         latestDetectedRef.current = {
                                                                             dominantCapKey,
                                                                             scoreMap,
                                                                             highestScore
                                                                         }

                                                                         // Draw Custom Bounding Box and Flipped Text Label
                                                                         const box = resizedDetections.detection.box
                                                                         const x = box.x
                                                                         const y = box.y
                                                                         const width = box.width
                                                                         const height = box.height

                                                                         const emotionColor = EMOTION_COLORS[highestEmotion.charAt(0).toUpperCase() + highestEmotion.slice(1)] || '#059669'

                                                                         ctx.strokeStyle = emotionColor
                                                                         ctx.lineWidth = 2
                                                                         ctx.strokeRect(x, y, width, height)

                                                                         ctx.save()
                                                                         ctx.translate(x + width / 2, y - 5)
                                                                         ctx.scale(-1, 1)

                                                                         ctx.textAlign = 'center'
                                                                         ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

                                                                         const labelText = `${dominantCapKey}: ${(highestScore * 100).toFixed(1)}%`
                                                                         const textMetrics = ctx.measureText(labelText)
                                                                         const bgWidth = textMetrics.width + 12
                                                                         const bgHeight = 24
                                                                         ctx.fillStyle = emotionColor
                                                                         ctx.fillRect(-bgWidth / 2, -bgHeight + 4, bgWidth, bgHeight)

                                                                         ctx.fillStyle = '#FFFFFF'
                                                                         ctx.fillText(labelText, 0, 0)
                                                                         ctx.restore()

                                                                     } else {
                                                                         canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                                                                     }
                                                                 }
                                                             }, 150)
                                                             canvasRef.current.intervalId = interval;
                                                         }}
                                                         onPause={() => {
                                                             if (canvasRef.current && canvasRef.current.intervalId) {
                                                                 clearInterval(canvasRef.current.intervalId)
                                                             }
                                                             if (canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                                                         }}
                                                     />

                                                     {recording && (
                                                         <div className="absolute inset-0 border-4 border-red-500 rounded-xl">
                                                             <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/80 rounded-lg px-3 py-1.5 z-10">
                                                                 <div className="w-2.5 h-2.5 bg-red-500 rounded-full record-pulse" />
                                                                 <span className="text-white text-xs font-bold">REC</span>
                                                             </div>
                                                             {/* Circular countdown */}
                                                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 z-10">
                                                                 <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                                     <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                                                                     <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="2"
                                                                         strokeDasharray={`${(countdown / RECORD_SECONDS) * 100} 100`} strokeLinecap="round" />
                                                                 </svg>
                                                                 <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md">{countdown}</span>
                                                             </div>
                                                         </div>
                                                     )}
                                                     <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ transform: 'scaleX(-1) translateZ(0)', willChange: 'transform', backfaceVisibility: 'hidden' }} />

                                                     {/* Floating Emojis Overlay */}
                                                     <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                                                         <AnimatePresence>
                                                             {floatingEmojis.map(emoji => (
                                                                 <motion.div
                                                                     key={emoji.id}
                                                                     initial={{ opacity: 0, y: 50, scale: 0.5, x: emoji.left }}
                                                                     animate={{
                                                                         opacity: [0, 1, 0],
                                                                         y: -150 - Math.random() * 100,
                                                                         scale: 1,
                                                                         x: `calc(${emoji.left} + ${Math.random() > 0.5 ? 20 : -20}px)`
                                                                     }}
                                                                     exit={{ opacity: 0 }}
                                                                     transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
                                                                     className="absolute bottom-0 text-3xl"
                                                                     style={{ fontSize: `${emoji.size}px`, transform: 'translateX(-50%)' }}
                                                                     onAnimationComplete={() => {
                                                                         setFloatingEmojis(prev => prev.filter(e => e.id !== emoji.id))
                                                                     }}
                                                                 >
                                                                     {EMOTION_EMOJI[emoji.emotion]}
                                                                 </motion.div>
                                                             ))}
                                                         </AnimatePresence>
                                                     </div>

                                                     {videoBlob && !recording && (
                                                         <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
                                                             <div className="text-center p-6 bg-white/95 rounded-2xl border border-slate-200 shadow-xl">
                                                                 <p className="text-emerald-700 font-bold text-lg">✅ Recording Complete!</p>
                                                                 <p className="text-slate-600 text-xs mt-1">Click Analyze to process facial emotion telemetry</p>
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                             )}
                                         </div>

                                         {/* Controls & Instructions below */}
                                         <div className="w-full flex flex-col justify-center">
                                             {permission ? (
                                                 <div className="p-6 md:p-7 text-center relative z-10 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm w-full">
                                                     <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                                                         <Brain className="text-emerald-600" size={22} /> AI Analysis
                                                     </h2>
                                                     <p className="mb-5 text-sm font-medium text-slate-600 tracking-normal leading-relaxed">
                                                         {modelsLoaded
                                                             ? <><span className="text-emerald-700 font-bold">Instruction:</span> Look directly at the camera and speak naturally for 20 seconds. Ensure good lighting.</>
                                                             : <>⏳ Initializing local face tracking models...</>
                                                         }
                                                     </p>
                                                     <div className="flex gap-3 justify-center flex-wrap">
                                                         {!recording && !videoBlob && (
                                                             <motion.button onClick={startRecording}
                                                                 disabled={!modelsLoaded}
                                                                 className={`px-8 py-3.5 flex items-center gap-2 rounded-xl transition-all w-full sm:w-auto justify-center uppercase text-xs font-bold tracking-wider ${!modelsLoaded ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)]'}`}
                                                                 whileHover={modelsLoaded ? { scale: 1.01 } : {}}
                                                             >
                                                                 <Camera size={16} /> Start 20-sec Recording
                                                             </motion.button>
                                                         )}
                                                         {recording && (
                                                             <motion.button onClick={stopRecording}
                                                                 className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto uppercase text-xs tracking-wider"
                                                                 whileHover={{ scale: 1.01 }}>
                                                                 <StopCircle size={18} /> Stop Recording
                                                             </motion.button>
                                                         )}
                                                         {videoBlob && !recording && (
                                                             <div className="flex gap-3 w-full flex-col sm:flex-row justify-center mt-2">
                                                                 <button onClick={() => {
                                                                     setVideoBlob(null);
                                                                     if (!stream || !stream.active) {
                                                                         requestCamera().then(() => startRecording());
                                                                     } else {
                                                                         startRecording();
                                                                     }
                                                                 }}
                                                                     className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all sm:flex-1 max-w-[200px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs uppercase tracking-wider"
                                                                 >
                                                                     <RefreshCw size={16} /> Retake
                                                                 </button>
                                                                 <motion.button onClick={uploadAndAnalyze} disabled={loading}
                                                                     className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all sm:flex-[1.5] max-w-[250px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold uppercase text-xs tracking-wider shadow-[0_4px_14px_rgba(5,150,105,0.3)]"
                                                                     whileHover={{ scale: 1.01 }}>
                                                                     {loading
                                                                         ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                                                                         : <><Upload size={16} />Analyze Face</>}
                                                                 </motion.button>
                                                             </div>
                                                         )}
                                                     </div>
                                                 </div>
                                             ) : (
                                                 <div className="p-6 md:p-8 text-center relative z-10 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm w-full">
                                                     <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                                                         <Brain className="text-slate-400" size={22} /> AI Analysis
                                                     </h2>
                                                     <p className="text-sm font-medium text-slate-600 tracking-normal leading-relaxed">
                                                         Please enable your camera to proceed with the facial emotion analysis step. Ensure you are in a well-lit environment.
                                                     </p>
                                                 </div>
                                             )}
                                         </div>
                                     </div>

                                    {/* Right Column (Conditional) */}
                                    {(recording || videoBlob) && !result && (
                                        <div className="lg:col-span-5 flex flex-col justify-between h-full w-full gap-4">
                                            {/* Live Emotion Graph UI */}
                                            {permission && (
                                                <motion.div className="bg-white/95 rounded-2xl border border-slate-200/90 p-5 mt-0 w-full shadow-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider font-display">Live Emotion Activity</h3>
                                                    <div className="space-y-3">
                                                        {Object.entries(liveScores).map(([emotion, score]) => (
                                                            <div key={emotion} className="flex items-center gap-3">
                                                                <div className="w-24 text-xs text-slate-600 text-right font-medium">
                                                                    {emotion} {EMOTION_EMOJI[emotion]}
                                                                </div>
                                                                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                                    <motion.div
                                                                        className="h-full rounded-full"
                                                                        style={{ backgroundColor: EMOTION_COLORS[emotion] || '#059669' }}
                                                                        animate={{ width: `${score}%` }}
                                                                        transition={{ duration: 0.6, ease: 'linear' }}
                                                                    />
                                                                </div>
                                                                <div className="w-12 text-xs font-mono font-semibold text-slate-700">{Math.round(score)}%</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Real-time Timeline Graph */}
                                            {permission && timelineData.length > 0 && (
                                                <motion.div className="bg-white/95 rounded-2xl border border-slate-200/90 p-5 mt-0 w-full shadow-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider font-display">Emotional State Timeline</h3>
                                                    <ResponsiveContainer width="100%" height={180}>
                                                        <LineChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={8} />
                                                            <YAxis hide domain={[0, 100]} />
                                                            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }} itemStyle={{ fontSize: 12, color: '#0f172a' }} labelStyle={{ color: '#64748b', marginBottom: 4 }} />
                                                            {['Happy', 'Neutral', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'].map(emp => (
                                                                <Line key={emp} type="monotone" dataKey={emp} stroke={EMOTION_COLORS[emp]} strokeWidth={2} dot={false} isAnimationActive={false} />
                                                            ))}
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </motion.div>
                                            )}

                                            {/* Live Insight Ticker */}
                                            {recording && dominantEmotion && (
                                                <motion.div
                                                    className="bg-white rounded-2xl border border-slate-200 p-4 text-center border-l-4 mt-0 w-full shadow-sm"
                                                    style={{ borderLeftColor: EMOTION_COLORS[dominantEmotion] }}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    key={dominantEmotion} // force re-animation when emotion changes
                                                >
                                                    <p className="text-sm font-medium drop-shadow" style={{ color: EMOTION_COLORS[dominantEmotion] }}>
                                                        {INSIGHT_TEXTS[dominantEmotion]}
                                                    </p>
                                                </motion.div>
                                            )}

                                            {/* Live Frame Count Summary Dashboard */}
                                            <motion.div className="bg-white/95 rounded-2xl border border-slate-200/90 p-5 mt-0 w-full shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Live Frame Count Summary</h3>
                                                <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                                                    {Object.entries(liveCounts).map(([emp, count]) => (
                                                        <div key={emp} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center flex flex-col justify-center items-center">
                                                            <div className="text-xl leading-none mb-1">{EMOTION_EMOJI[emp]}</div>
                                                            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{emp}</div>
                                                            <div className="text-emerald-700 font-mono text-lg font-bold mt-1 leading-none">{count}</div>
                                                            <div className="text-slate-400 text-[9px] uppercase mt-0.5">frames</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <motion.div className="space-y-5"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

                                {/* Emotion result card */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        ['Emotion', result.facial_emotion, '#0d9488'],
                                        ['Severity', `${result.severity_score}/10`, SEVERITY_COLOR(result.severity_score)],
                                        ['Confidence', `${(result.confidence * 100).toFixed(1)}%`, '#059669'],
                                    ].map(([k, v, c]) => (
                                        <div key={k} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
                                            <div className="font-display text-3xl lg:text-4xl font-extrabold mb-1" style={{ color: c }}>{v}</div>
                                            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mt-1">{k}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Counsellor Insight */}
                                <motion.div className="bg-emerald-50/70 border-l-4 border-emerald-500 rounded-r-2xl p-6 border-y border-r border-emerald-100/60 shadow-sm">
                                    <h3 className="text-xs uppercase tracking-widest text-emerald-800 font-bold mb-2 flex items-center gap-2">
                                        <Brain size={16} className="text-emerald-600" /> AI CLINICAL INSIGHT
                                    </h3>
                                    <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed italic">
                                        "{
                                            {
                                                'Happy': "You seem to be experiencing positive emotions. It's wonderful to see you in a good space. Hold on to this feeling!",
                                                'Sad': "We detected signs of sadness. It's completely okay to feel this way. Remember to be gentle with yourself right now.",
                                                'Fear': "We noticed expressions that may indicate fear or anxiety. Take a slow, deep breath. You are in a safe space.",
                                                'Disgust': "There are hints of discomfort or aversion. We're here to help you unpack those feelings safely.",
                                                'Surprise': "We saw a reaction of surprise. Whether it's positive or overwhelming, take a moment to process what you're feeling.",
                                                'Angry': "We detected high levels of frustration or anger. Take a deep breath, this is a safe space to express yourself.",
                                                'Neutral': "You're displaying a calm and balanced state. Sometimes neutral is exactly what we need for clarity and focus."
                                            }[result.facial_emotion] || "Let's continue to explore your emotions."
                                        }"
                                    </p>
                                </motion.div>

                                {/* Advanced Psychological Metrics */}
                                <motion.div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                                        <Activity size={16} className="text-emerald-600" /> ADVANCED PSYCHOLOGICAL METRICS
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Derived Complex Emotion</div>
                                            <div className="text-slate-900 font-bold text-base sm:text-lg">{getComplexEmotion()}</div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Emotional Volatility (Mood Swings)</div>
                                            <div className="text-slate-900 font-bold text-base sm:text-lg">{calculateVolatility()}</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Pie chart */}
                                {pieData.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">📊 EMOTION DISTRIBUTION</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" nameKey="name"
                                                    cx="50%" cy="50%" outerRadius={80}
                                                    label={({ name, value }) => value > 0 ? `${name}: ${value}%` : ''}>
                                                    {pieData.map(e => <Cell key={e.name} fill={EMOTION_COLORS[e.name] || '#6366F1'} />)}
                                                </Pie>
                                                <Tooltip formatter={v => `${v}%`}
                                                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#0f172a' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Real-time Timeline Graph */}
                                {timelineData.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">SESSION TIMELINE SUMMARY</h3>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <LineChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={8} />
                                                <YAxis hide domain={[0, 100]} />
                                                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} itemStyle={{ fontSize: 12 }} labelStyle={{ color: '#64748b', marginBottom: 4 }} />
                                                {['Happy', 'Neutral', 'Sad', 'Angry', 'Surprise', 'Fear', 'Disgust'].map(emp => (
                                                    <Line key={emp} type="monotone" dataKey={emp} stroke={EMOTION_COLORS[emp]} strokeWidth={2} dot={false} isAnimationActive={false} />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Session Frame Count Summary */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 text-center">SESSION FRAME METRICS</h3>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {Object.entries(liveCounts).map(([emp, count]) => (
                                            <div key={emp} className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 flex flex-col items-center min-w-[85px]">
                                                <div className="text-xl leading-none mb-1">{EMOTION_EMOJI[emp]}</div>
                                                <div className="text-emerald-700 text-xl font-bold leading-none my-1">{count}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{emp}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8 flex-col md:flex-row">
                                    <button onClick={handleRetry}
                                        className="px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                                    >
                                        <RefreshCw className="inline" size={18} /> Retake Analysis
                                    </button>
                                    <motion.button onClick={() => nav('/voice')}
                                        className="btn-primary px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all flex-1 shadow-md shadow-emerald-600/20 font-semibold"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Proceed to Step 4 → Voice Analysis
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
    )
}
