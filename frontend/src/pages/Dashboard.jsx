import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Mic2, Zap, Clock, Download, TrendingUp, Play,
  BookOpen, FileText, Headphones, Star, ChevronRight,
  BarChart2, Sparkles, Globe, Volume2,
} from 'lucide-react'
import { getHistory } from '../services/api'

const QUICK_TEMPLATES = [
  { icon: '📢', label: 'Announcement',   desc: 'Quick school update',     query: 'announcement' },
  { icon: '📝', label: 'Homework',        desc: 'Assignment instructions', query: 'homework' },
  { icon: '🌅', label: 'Morning Assembly',desc: 'Daily assembly script',   query: 'assembly' },
  { icon: '📖', label: 'Chapter Summary', desc: 'Lesson audio summary',    query: 'revision' },
  { icon: '🌐', label: 'Translation',     desc: 'Hindi/Marathi/Gujarati',  query: 'translate' },
  { icon: '✏️', label: 'Reading Practice',desc: 'Student reading audio',   query: 'reading' },
]

const WEEKLY = [40, 72, 55, 88, 64, 95, 78]
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color ? `${color}20` : 'rgba(99,102,241,0.12)' }}
      >
        <Icon size={20} style={{ color: color || '#818cf8' }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-100">{value}</p>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [recents, setRecents] = useState([])
  const [loadingRecents, setLoadingRecents] = useState(true)

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Teacher'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    getHistory({ limit: 5 })
      .then((r) => setRecents(r.data?.items || []))
      .catch(() => setRecents([]))
      .finally(() => setLoadingRecents(false))
  }, [])

  const maxBar = Math.max(...WEEKLY)

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {greeting}, {displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your audio activity overview</p>
        </div>
        <Link to="/generate" className="btn-primary self-start sm:self-auto">
          <Zap size={16} />
          Generate Audio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Headphones}  label="Total Audio"        value="—"   sub="All time"  color="#818cf8" />
        <StatCard icon={Mic2}        label="Today's Recordings" value="—"   sub="Today"     color="#34d399" />
        <StatCard icon={Download}    label="Downloads"          value="—"   sub="All time"  color="#f59e0b" />
        <StatCard icon={Clock}       label="Minutes Generated"  value="—"   sub="Total"     color="#f87171" />
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-100">Weekly Activity</h2>
            <span className="text-xs text-slate-500">This Week</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {WEEKLY.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${(val / maxBar) * 120}px`,
                    background: i === 6
                      ? 'linear-gradient(to top,#4f46e5,#818cf8)'
                      : 'rgba(99,102,241,0.25)',
                  }}
                />
                <span className="text-xs text-slate-600">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Generate */}
        <div className="card">
          <h2 className="font-semibold text-slate-100 mb-4">Quick Generate</h2>
          <div className="space-y-2">
            {QUICK_TEMPLATES.map(({ icon, label, desc, query }) => (
              <Link
                key={label}
                to={`/generate?template=${query}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 truncate">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Recordings */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-100">Recent Recordings</h2>
          <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {loadingRecents ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-2 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Mic2 size={28} className="text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">No recordings yet</p>
            <p className="text-slate-600 text-xs mb-4">Generate your first audio to see it here</p>
            <Link to="/generate" className="btn-primary text-sm py-2 px-4">
              <Zap size={14} />
              Generate Audio
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recents.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Volume2 size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{item.title || 'Untitled'}</p>
                  <p className="text-xs text-slate-500">{item.voice_name} · {item.language}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-600">{item.duration_secs}s</span>
                  <button className="btn-ghost p-1.5">
                    <Play size={14} className="text-indigo-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
