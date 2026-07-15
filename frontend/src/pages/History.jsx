import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Clock, Play, Pause, Download, Trash2, Star, Search,
  Filter, FolderOpen, Loader2, Volume2, MoreHorizontal,
  RefreshCcw, ChevronLeft, ChevronRight, Mic2,
} from 'lucide-react'
import { getHistory, deleteHistory, updateHistory } from '../services/api'

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc',  label: 'Oldest First' },
  { value: 'title:asc',       label: 'Title A–Z' },
  { value: 'duration:desc',   label: 'Longest First' },
]

const LANG_OPTIONS = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'ta', label: 'Tamil' },
]

const PAGE_SIZE = 10

export default function History() {
  const { user } = useAuth()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sort, setSort]           = useState('created_at:desc')
  const [langFilter, setLangFilter] = useState('')
  const [favOnly, setFavOnly]     = useState(false)
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [playing, setPlaying]     = useState(null)
  const [openMenu, setOpenMenu]   = useState(null)
  const audioRef = useRef(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const [sortBy, sortDir] = sort.split(':')
      const r = await getHistory({
        q: search || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        language: langFilter || undefined,
        favorites: favOnly || undefined,
        page,
        limit: PAGE_SIZE,
      })
      setItems(r.data?.items || [])
      setTotal(r.data?.total || 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, sort, langFilter, favOnly, page])

  useEffect(() => {
    const t = setTimeout(loadHistory, 300)
    return () => clearTimeout(t)
  }, [loadHistory])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this recording?')) return
    try {
      await deleteHistory(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
    setOpenMenu(null)
  }

  const handleFavorite = async (item) => {
    try {
      await updateHistory(item.id, { is_favorite: !item.is_favorite })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i))
    } catch {
      toast.error('Update failed')
    }
    setOpenMenu(null)
  }

  const handleRename = async (item) => {
    const newTitle = prompt('New title:', item.title)
    if (!newTitle || newTitle === item.title) return
    try {
      await updateHistory(item.id, { title: newTitle })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, title: newTitle } : i))
      toast.success('Renamed')
    } catch {
      toast.error('Rename failed')
    }
    setOpenMenu(null)
  }

  const togglePlay = (item) => {
    if (playing === item.id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(item.audio_url)
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed:", e)
        toast.error("Could not play audio. Link might be expired or invalid.")
        setPlaying(null)
      })
      setPlaying(item.id)
      audioRef.current.onended = () => {
        setPlaying(null)
      }
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Audio History
          </h1>
          <p className="text-slate-500 text-sm mt-1">{total} recordings found</p>
        </div>
        <button onClick={loadHistory} className="btn-ghost text-sm self-start">
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search recordings…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-9 py-2"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="input-field py-2 w-auto"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={langFilter}
            onChange={(e) => { setLangFilter(e.target.value); setPage(1) }}
            className="input-field py-2 w-auto"
          >
            {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => { setFavOnly((v) => !v); setPage(1) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              favOnly
                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                : 'border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star size={14} />
            Favorites
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-4 p-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-2 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <Mic2 size={32} className="text-indigo-400" />
          </div>
          <p className="text-slate-300 font-medium mb-2">No recordings found</p>
          <p className="text-slate-500 text-sm">Try adjusting your filters or generate your first audio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-4 relative group">
              {/* Play button */}
              <button
                onClick={() => togglePlay(item)}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                style={{ background: playing === item.id ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.12)' }}
              >
                {playing === item.id
                  ? <Pause size={16} className="text-indigo-400" />
                  : <Play size={16} className="text-indigo-400 ml-0.5" />
                }
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{item.title || 'Untitled'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">{item.voice_name}</span>
                  <span
                    className="badge text-xs"
                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '1px 6px', fontSize: '0.65rem' }}
                  >
                    {item.language?.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock size={10} />
                    {fmt(item.duration_secs || 0)}
                  </span>
                </div>
              </div>

              {/* Date */}
              <span className="text-xs text-slate-600 hidden sm:block shrink-0">
                {new Date(item.created_at).toLocaleDateString()}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleFavorite(item)}
                  className="btn-ghost p-1.5"
                  title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={14} className={item.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                </button>
                {item.audio_url && (
                  <a href={item.audio_url} download className="btn-ghost p-1.5" title="Download">
                    <Download size={14} />
                  </a>
                )}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                    className="btn-ghost p-1.5"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {openMenu === item.id && (
                    <div
                      className="absolute right-0 top-full mt-1 z-30 rounded-xl shadow-xl overflow-hidden min-w-[140px]"
                      style={{ background: '#1e1e2e', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      <button
                        onClick={() => handleRename(item)}
                        className="block w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-indigo-600/20"
                      >
                        ✏️ Rename
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="block w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-600/20"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost p-2 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost p-2 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
