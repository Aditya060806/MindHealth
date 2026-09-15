import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, Calendar, AlertCircle, Sparkles,
  ArrowUpRight, ArrowDownRight, Moon, Zap, Heart, Brain, RefreshCw
} from 'lucide-react'
import API from '../api'
import StudentNavbar from '../components/StudentNavbar'

export default function StudentAnalytics() {
  const [days, setDays] = useState(30)
  const [trendData, setTrendData] = useState([])
  const [history, setHistory] = useState([])
  const [correlations, setCorrelations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      API.get(`/api/student/analytics/trends?days=${days}`).catch(() => ({ data: { trends: [], correlations: [] } })),
      API.get('/api/student-assessment/history').catch(() => ({ data: { history: [] } }))
    ]).then(([trendsRes, historyRes]) => {
      setTrendData(trendsRes.data.trends || [])
      setCorrelations(trendsRes.data.correlations || [])
      setHistory(historyRes.data.history || [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [days])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <StudentNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Wellbeing Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Student Wellbeing Trends & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Observational patterns tracking how sleep, academic deadlines, and recovery interact over time.
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  days === d
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Chart 1: Academic Stress & Sleep Trends (Correlation Area) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Stress vs. Sleep Recovery Trajectory
              </h3>
              <p className="text-xs text-slate-500">
                Observing the inverse correlation between daily sleep hours and academic stress levels.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold font-mono">
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Stress Index (0-100)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Sleep Hours (scaled)
              </span>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Area type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#stressGrad)" name="Stress Index" />
                <Area type="monotone" dataKey="sleep" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#sleepGrad)" name="Sleep Hours (x10)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center gap-2 mb-2 text-emerald-800">
              <Sparkles size={16} />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                Observation: Sleep Deficit & Exam Anxiety
              </h4>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Sleep &lt; 6 hours correlates with +28% higher lecture stress
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              When sleep falls below 6 hours for two consecutive nights, reported concentration drop and worry loops noticeably elevate. Protecting a 7-hour baseline acts as a physiological buffer against academic overwhelm.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
              Pattern Observation • Not Clinical Causation
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2 mb-2 text-amber-800">
              <Zap size={16} />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                Observation: Workload Spikes & Energy Dips
              </h4>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Consecutive multi-hour cramming leads to Day 3 fatigue
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students logging over 4 hours of uninterrupted desk work experience an acute drop in motivation 48 hours later. Introducing 25-minute Pomodoro intervals smooths out recovery.
            </p>
            <span className="inline-block mt-3 text-[10px] font-mono text-amber-700 font-bold bg-white px-2 py-0.5 rounded border border-amber-200">
              Pattern Observation • Not Clinical Causation
            </span>
          </div>
        </div>

        {/* Assessment History Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Assessment History & Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Track how your overall college wellbeing changes between exam and placement seasons.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Take regular assessments to build a comparative trajectory over your semester.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Overall Index</th>
                    <th className="pb-3 font-semibold">Academic Stress</th>
                    <th className="pb-3 font-semibold">Burnout Risk</th>
                    <th className="pb-3 font-semibold">Career Stress</th>
                    <th className="pb-3 font-semibold">Severity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h, i) => (
                    <tr key={h.id || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-semibold text-slate-800">{h.date}</td>
                      <td className="py-3.5 font-bold font-mono text-emerald-700">{h.overall_score}/100</td>
                      <td className="py-3.5 font-mono text-slate-600">{h.academic_stress}%</td>
                      <td className="py-3.5 font-mono text-slate-600">{h.burnout_score}%</td>
                      <td className="py-3.5 font-mono text-slate-600">{h.career_stress}%</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {h.severity_category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
