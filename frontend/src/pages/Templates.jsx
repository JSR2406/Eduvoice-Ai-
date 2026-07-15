import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  BookOpen, Zap, Star, Copy, Trash2, Edit2, Plus,
  Loader2, Mic2, Clock, Search, Filter,
} from 'lucide-react'
import { getTemplates, deleteTemplate, createTemplate, updateTemplate } from '../services/api'

const BUILT_IN = [
  {
    id: 'builtin-1', title: 'Morning Assembly', emoji: '🌅',
    description: 'Generate daily school assembly scripts with thought of the day and announcements.',
    category: 'Assembly', query: 'assembly',
  },
  {
    id: 'builtin-2', title: 'Homework Instructions', emoji: '📝',
    description: 'Clear and structured homework instructions for any subject or grade.',
    category: 'Homework', query: 'homework',
  },
  {
    id: 'builtin-3', title: 'Reading Practice', emoji: '📖',
    description: 'Engaging reading passages for student practice in any language.',
    category: 'Reading', query: 'reading',
  },
  {
    id: 'builtin-4', title: 'Chapter Revision', emoji: '🔁',
    description: 'Concise audio revision notes for any chapter or topic.',
    category: 'Revision', query: 'revision',
  },
  {
    id: 'builtin-5', title: 'School Announcement', emoji: '📢',
    description: 'Professional announcements for events, exams, or updates.',
    category: 'Announcements', query: 'announcement',
  },
  {
    id: 'builtin-6', title: 'Chapter Summary', emoji: '📚',
    description: 'AI-summarized audio version of any textbook chapter.',
    category: 'Summary', query: 'summarize',
  },
]

const CATEGORIES = ['All', 'Assembly', 'Homework', 'Reading', 'Revision', 'Announcements', 'Summary', 'Custom']

function TemplateCard({ tpl, onDelete, onFav, onUse, isBuiltIn }) {
  return (
    <div className="card flex flex-col h-full group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tpl.emoji || '📋'}</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{tpl.title}</h3>
            <span
              className="badge text-xs"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '1px 6px', fontSize: '0.6rem' }}
            >
              {tpl.category}
            </span>
          </div>
        </div>
        {!isBuiltIn && (
          <button
            onClick={() => onFav(tpl)}
            className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Star size={14} className={tpl.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-4">{tpl.description}</p>

      <div className="flex gap-2">
        <Link
          to={`/generate?template=${tpl.query || 'custom'}`}
          className="btn-primary flex-1 justify-center text-xs py-2"
        >
          <Zap size={12} />
          Use Template
        </Link>
        {!isBuiltIn && (
          <button
            onClick={() => onDelete(tpl.id)}
            className="btn-ghost p-2 text-red-400 hover:text-red-300"
            title="Delete template"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Templates() {
  const { user } = useAuth()
  const [custom, setCustom]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('All')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating]     = useState(false)
  const [newTpl, setNewTpl]         = useState({ title: '', description: '', emoji: '📋', category: 'Custom' })

  useEffect(() => {
    getTemplates()
      .then((r) => setCustom(r.data?.templates || []))
      .catch(() => setCustom([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      await deleteTemplate(id)
      setCustom((prev) => prev.filter((t) => t.id !== id))
      toast.success('Template deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleFav = async (tpl) => {
    try {
      await updateTemplate(tpl.id, { is_favorite: !tpl.is_favorite })
      setCustom((prev) => prev.map((t) => t.id === tpl.id ? { ...t, is_favorite: !t.is_favorite } : t))
    } catch {
      toast.error('Update failed')
    }
  }

  const handleCreate = async () => {
    if (!newTpl.title.trim()) { toast.error('Title is required'); return }
    setCreating(true)
    try {
      const r = await createTemplate(newTpl)
      setCustom((prev) => [r.data?.template || { ...newTpl, id: Date.now().toString() }, ...prev])
      setShowCreate(false)
      setNewTpl({ title: '', description: '', emoji: '📋', category: 'Custom' })
      toast.success('Template created!')
    } catch {
      toast.error('Create failed')
    } finally {
      setCreating(false)
    }
  }

  const allTemplates = [
    ...BUILT_IN.map((t) => ({ ...t, isBuiltIn: true })),
    ...custom.map((t) => ({ ...t, isBuiltIn: false })),
  ]

  const filtered = allTemplates.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || t.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Templates
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ready-to-use content templates for teachers</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary self-start sm:self-auto">
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 w-52"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                category === c
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'text-slate-400 border-slate-700/50 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40">
              <div className="skeleton h-4 w-2/3 rounded mb-3" />
              <div className="skeleton h-3 w-full rounded mb-2" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              isBuiltIn={tpl.isBuiltIn}
              onDelete={handleDelete}
              onFav={handleFav}
              onUse={() => {}}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-5">Create Template</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Emoji</label>
                  <input
                    type="text"
                    value={newTpl.emoji}
                    onChange={(e) => setNewTpl((p) => ({ ...p, emoji: e.target.value }))}
                    className="input-field w-16 text-center text-xl"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1.5">Title</label>
                  <input
                    type="text"
                    placeholder="Template title"
                    value={newTpl.title}
                    onChange={(e) => setNewTpl((p) => ({ ...p, title: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                <textarea
                  placeholder="Describe what this template generates…"
                  value={newTpl.description}
                  onChange={(e) => setNewTpl((p) => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Category</label>
                <select
                  value={newTpl.category}
                  onChange={(e) => setNewTpl((p) => ({ ...p, category: e.target.value }))}
                  className="input-field"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 justify-center">
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
