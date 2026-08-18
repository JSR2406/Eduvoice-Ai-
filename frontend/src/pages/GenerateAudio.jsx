import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Mic2, Sparkles, Globe, Zap, Download, Save, Share2,
  Play, Pause, Square, Volume2, VolumeX, Loader2,
  ChevronDown, FileText, BookOpen, RefreshCcw, X,
  Clock, AlignLeft, Wand2, Languages, GraduationCap,
} from 'lucide-react'
import {
  fetchVoices, generateAudio, uploadPDF,
  summarizeText, translateText, rewriteForGrade,
  generateHomework, generateAnnouncement, generateRevision, generateReading, generateAssembly,
  generateLesson, generateStory, generateQuiz, generateDebate
} from '../services/api'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ta', label: 'Tamil' },
]

const EMOTIONS = [
  { value: 'neutral',      label: '😐 Neutral' },
  { value: 'happy',        label: '😊 Happy' },
  { value: 'professional', label: '👔 Professional' },
  { value: 'calm',         label: '🧘 Calm' },
  { value: 'excited',      label: '🎉 Excited' },
  { value: 'serious',      label: '🧐 Serious' },
]

const GRADES = ['Grade 1-2', 'Grade 3-4', 'Grade 5-6', 'Grade 7-8', 'Grade 9-10', 'Grade 11-12']

const TEMPLATE_PROMPTS = {
  announcement: 'Write a brief school announcement about the upcoming Annual Sports Day on 25th July. Include timing, venue, and student participation details.',
  homework:     'Write homework instructions for Class 7 students: Read Chapter 4 of Science textbook on Photosynthesis and answer Q1 to Q5 in the exercise.',
  assembly:     'Write a morning school assembly script. Include thought of the day, national news highlights, and motivational message for students.',
  revision:     'Create a revision audio script for the chapter "The French Revolution" for Class 9 students. Cover key events, causes, and outcomes.',
  translate:    'Good morning, students. Today we will learn about photosynthesis — the process by which plants prepare their food using sunlight.',
  reading:      'Write a reading practice passage about the water cycle for Class 5 students. Keep it engaging and educational.',
}

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01, tooltip }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="text-xs text-indigo-400 font-mono font-bold">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        title={tooltip}
      />
    </div>
  )
}

export default function GenerateAudio() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // Text state
  const [text, setText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [estimatedDuration, setEstimatedDuration] = useState(0)

  // Voice settings
  const [voices, setVoices] = useState([])
  const [voicesLoading, setVoicesLoading] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedEmotion, setSelectedEmotion] = useState('neutral')
  const [speed, setSpeed] = useState(1.0)
  const [stability, setStability] = useState(0.5)
  const [similarity, setSimilarity] = useState(0.75)

  // Audio state
  const [generating, setGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  // AI state
  const [aiLoading, setAiLoading] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState('Grade 7-8')
  const [translateTarget, setTranslateTarget] = useState('hi')
  const [showGradeMenu, setShowGradeMenu] = useState(false)

  // Script generation state
  const [topicInput, setTopicInput] = useState('')
  const [scriptCategory, setScriptCategory] = useState('homework')
  const fileInputRef = useRef(null)

  // Pre-fill template
  useEffect(() => {
    const tpl = searchParams.get('template')
    if (tpl && TEMPLATE_PROMPTS[tpl]) {
      setText(TEMPLATE_PROMPTS[tpl])
    }
  }, [searchParams])

  // Text metrics
  useEffect(() => {
    setCharCount(text.length)
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    setWordCount(words)
    setEstimatedDuration(Math.max(0, Math.round(words / 2.5)))
  }, [text])

  // Fetch voices
  useEffect(() => {
    setVoicesLoading(true)
    fetchVoices()
      .then((r) => {
        setVoices(r.data?.voices || [])
        if (r.data?.voices?.length) setSelectedVoice(r.data.voices[0].voice_id)
      })
      .catch(() => {
        // Fallback voices for demo
        const fallback = [
          { voice_id: 'rachel',   name: 'Rachel (English Female)' },
          { voice_id: 'adam',     name: 'Adam (English Male)' },
          { voice_id: 'ananya',   name: 'Ananya (Hindi Female)' },
          { voice_id: 'arjun',    name: 'Arjun (Hindi Male)' },
        ]
        setVoices(fallback)
        setSelectedVoice(fallback[0].voice_id)
      })
      .finally(() => setVoicesLoading(false))
  }, [])

  // Audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onDur  = () => setDuration(audio.duration)
    const onEnd  = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDur)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDur)
      audio.removeEventListener('ended', onEnd)
    }
  }, [audioUrl])

  const handleGenerate = async () => {
    if (!text.trim()) { toast.error('Please enter some text first.'); return }
    if (!selectedVoice) { toast.error('Please select a voice.'); return }
    if (charCount > 5000) { toast.error('Text is too long. Maximum 5000 characters.'); return }

    setGenerating(true)
    setAudioUrl(null)
    setIsPlaying(false)
    try {
      const resp = await generateAudio({
        text,
        voice_id: selectedVoice,
        language: selectedLanguage,
        emotion: selectedEmotion,
        speed,
        stability,
        similarity_boost: similarity,
        user_id: user?.id || undefined,
        save_to_history: !!user,
        title: text.trim().slice(0, 30) + (text.trim().length > 30 ? '...' : ''),
      })

      const blob = new Blob([resp.data], { type: 'audio/mpeg' })
      const url  = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setAudioUrl(url)
      toast.success('Audio generated! 🎙️')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Audio generation failed. Check your API key.')
    } finally {
      setGenerating(false)
    }
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  const handleDownload = () => {
    if (!audioBlob) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(audioBlob)
    link.download = `eduvoice-${Date.now()}.mp3`
    link.click()
    toast.success('Downloading MP3…')
  }

  const handleShare = async () => {
    if (!audioUrl) return
    if (navigator.share) {
      try {
        const file = new File([audioBlob], 'eduvoice.mp3', { type: 'audio/mpeg' })
        await navigator.share({ files: [file], title: 'EduVoice AI Audio' })
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  // ── AI helpers ──
  const runAI = async (fn, payload, successMsg) => {
    if (!text.trim()) { toast.error('Enter some text first.'); return }
    setAiLoading(fn.name)
    try {
      const r = await fn(payload)
      const result = r.data?.result || r.data?.text || ''
      if (result) { setText(result); toast.success(successMsg) }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI request failed.')
    } finally {
      setAiLoading(null)
    }
  }

  const aiSummarize   = () => runAI(summarizeText,      { text }, 'Text summarized! ✨')
  const aiTranslate   = () => runAI(translateText,      { text, target_language: translateTarget }, `Translated to ${LANGUAGES.find(l => l.code === translateTarget)?.label}!`)
  const aiRewrite     = (g) => runAI(rewriteForGrade,  { text, grade: g }, `Rewritten for ${g}!`)

  const runAIForScript = async (fn, payload, successMsg) => {
    if (!payload.topic?.trim()) { toast.error('Please provide a topic or document.'); return }
    setAiLoading(fn.name || 'ai_task')
    try {
      const r = await fn(payload)
      const result = r.data?.result || r.data?.text || ''
      if (result) { setText(result); toast.success(successMsg) }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Script generation failed.')
    } finally {
      setAiLoading(null)
    }
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.')
      return
    }

    setAiLoading('uploadPdf')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await uploadPDF(formData)
      const extractedText = uploadRes.data?.text
      if (!extractedText) throw new Error("No text extracted.")
      
      toast.success('PDF extracted! Generating lesson script...')
      // Automatically generate a lesson from the PDF content
      await runAIForScript(generateLesson, { topic: extractedText.substring(0, 8000) }, 'Lesson script generated from PDF!')
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'PDF processing failed.')
      setAiLoading(null)
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerateScript = () => {
    if (!topicInput.trim()) return;
    switch (scriptCategory) {
      case 'homework':
        runAIForScript(generateHomework, { topic: topicInput }, 'Homework script generated!');
        break;
      case 'announcement':
        runAIForScript(generateAnnouncement, { topic: topicInput }, 'Announcement script generated!');
        break;
      case 'revision':
        runAIForScript(generateRevision, { topic: topicInput }, 'Revision script generated!');
        break;
      case 'assembly':
        runAIForScript(generateAssembly, { topic: topicInput }, 'Assembly script generated!');
        break;
      case 'reading':
        runAIForScript(generateReading, { topic: topicInput }, 'Reading script generated!');
        break;
      case 'lesson':
        runAIForScript(generateLesson, { topic: topicInput }, 'Lesson script generated!');
        break;
      case 'story':
        runAIForScript(generateStory, { topic: topicInput }, 'Story script generated!');
        break;
      case 'quiz':
        runAIForScript(generateQuiz, { topic: topicInput }, 'Quiz script generated!');
        break;
      case 'debate':
        runAIForScript(generateDebate, { topic: topicInput }, 'Debate script generated!');
        break;
      default:
        break;
    }
  }

  const pct = duration ? (currentTime / duration) * 100 : 0
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-100 mb-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Generate Audio
        </h1>
        <p className="text-slate-500 text-sm">Convert your educational content into natural AI speech</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Text editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Generate Script Section */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wand2 size={14} className="text-indigo-400" />
                Generate Script by Category
              </p>
              
              {/* PDF Upload Button */}
              <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} 
                onChange={handlePdfUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={!!aiLoading}
                className="btn-secondary text-xs py-1 px-3 border border-indigo-500/30 hover:border-indigo-500/60"
                title="Upload a PDF resource to auto-generate a lesson script"
              >
                {aiLoading === 'uploadPdf' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} className="text-indigo-400" />}
                Upload PDF Resource
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="input-field shrink-0 w-full sm:w-auto min-w-[150px] h-auto py-2 px-3 text-sm"
                value={scriptCategory}
                onChange={(e) => setScriptCategory(e.target.value)}
              >
                <option value="homework">Homework</option>
                <option value="announcement">Announcement</option>
                <option value="revision">Revision</option>
                <option value="assembly">Assembly</option>
                <option value="reading">Reading</option>
                <option value="lesson">Lesson Plan</option>
                <option value="story">Story</option>
                <option value="quiz">Quiz</option>
                <option value="debate">Debate</option>
              </select>
              <input
                type="text"
                placeholder="Enter topic (e.g., 'Photosynthesis')"
                className="input-field flex-1 min-w-[200px] h-auto py-2 px-3 text-sm"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                   if (e.key === 'Enter') handleGenerateScript()
                }}
              />
              <button
                onClick={handleGenerateScript}
                disabled={!!aiLoading || !topicInput.trim()}
                className="btn-primary py-2 px-4 text-sm"
              >
                {aiLoading && ['generateHomework', 'generateAnnouncement', 'generateRevision', 'generateAssembly', 'generateReading'].includes(aiLoading) ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Generate
              </button>
            </div>
          </div>

          {/* AI Toolbar */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Enhance Content</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={aiSummarize}
                disabled={!!aiLoading}
                className="btn-secondary text-xs py-1.5 px-3"
                title="Summarize the text"
              >
                {aiLoading === 'summarizeText' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Summarize
              </button>

              <div className="flex items-center gap-1">
                <select
                  className="input-field text-xs py-1.5 px-2 h-auto"
                  value={translateTarget}
                  onChange={(e) => setTranslateTarget(e.target.value)}
                >
                  {LANGUAGES.filter(l => l.code !== 'en').map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
                <button
                  onClick={aiTranslate}
                  disabled={!!aiLoading}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {aiLoading === 'translateText' ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                  Translate
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowGradeMenu((v) => !v)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <GraduationCap size={12} />
                  Rewrite for Grade
                  <ChevronDown size={10} />
                </button>
                {showGradeMenu && (
                  <div
                    className="absolute top-full left-0 mt-1 z-20 rounded-xl shadow-xl overflow-hidden"
                    style={{ background: '#1e1e2e', border: '1px solid rgba(99,102,241,0.2)', minWidth: '160px' }}
                  >
                    {GRADES.map((g) => (
                      <button
                        key={g}
                        onClick={() => { aiRewrite(g); setShowGradeMenu(false) }}
                        className="block w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-indigo-600/20 transition-colors"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <span className="text-xs font-medium text-slate-400">Your Content</span>
              <button
                onClick={() => setText('')}
                className="btn-ghost text-xs py-1 px-2 text-slate-500"
                title="Clear text"
              >
                <X size={12} />
                Clear
              </button>
            </div>
            <textarea
              id="generate-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your lesson content here…&#10;&#10;Example: Good morning students! Today we will learn about photosynthesis — the magical process by which plants use sunlight to create their food…"
              className="w-full bg-transparent p-4 text-sm text-slate-200 resize-none outline-none leading-relaxed"
              style={{ minHeight: '280px', fontFamily: 'Inter, sans-serif' }}
            />
            <div
              className="flex items-center justify-between px-4 py-3 border-t text-xs text-slate-500"
              style={{ borderColor: 'rgba(99,102,241,0.12)' }}
            >
              <div className="flex gap-4">
                <span><span className="text-slate-300 font-medium">{wordCount}</span> words</span>
                <span><span className={charCount > 4500 ? 'text-red-400 font-medium' : 'text-slate-300 font-medium'}>{charCount}</span> / 5000 chars</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={11} />
                <span>~{estimatedDuration}s audio</span>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="card" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
              <audio ref={audioRef} src={audioUrl} preload="auto" />
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#818cf8)' }}
                >
                  {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div
                    className="w-full h-2 rounded-full cursor-pointer mb-1"
                    style={{ background: 'rgba(99,102,241,0.2)' }}
                    onClick={handleSeek}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(to right,#4f46e5,#818cf8)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{fmt(currentTime)}</span>
                    <span>{fmt(duration)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDownload} className="btn-primary flex-1 justify-center text-sm py-2">
                  <Download size={15} />
                  Download MP3
                </button>
                <button onClick={handleShare} className="btn-secondary flex-1 justify-center text-sm py-2">
                  <Share2 size={15} />
                  Share
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            id="generate-btn"
            onClick={handleGenerate}
            disabled={generating || !text.trim()}
            className="btn-primary w-full justify-center py-4 text-base glow-purple"
            style={{ borderRadius: '1rem', opacity: !text.trim() ? 0.5 : 1 }}
          >
            {generating ? (
              <>
                <div className="flex gap-0.5 mr-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="waveform-bar" style={{ height: '16px', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                Generating Audio…
              </>
            ) : (
              <>
                <Mic2 size={20} />
                Generate Audio
              </>
            )}
          </button>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Voice */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Volume2 size={16} className="text-indigo-400" />
              Voice Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Voice</label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="input-field"
                  disabled={voicesLoading}
                >
                  {voicesLoading ? (
                    <option>Loading voices…</option>
                  ) : (
                    voices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
                <select
                  id="language-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="input-field"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Emotion</label>
                <select
                  id="emotion-select"
                  value={selectedEmotion}
                  onChange={(e) => setSelectedEmotion(e.target.value)}
                  className="input-field"
                >
                  {EMOTIONS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Zap size={16} className="text-indigo-400" />
              Audio Fine-Tuning
            </h3>
            <div className="space-y-5">
              <Slider
                label="Speed"
                value={speed}
                onChange={setSpeed}
                min={0.5} max={2.0} step={0.05}
                tooltip="Voice playback speed"
              />
              <Slider
                label="Stability"
                value={stability}
                onChange={setStability}
                tooltip="Higher = more consistent voice"
              />
              <Slider
                label="Similarity Boost"
                value={similarity}
                onChange={setSimilarity}
                tooltip="How closely voice matches original speaker"
              />
            </div>
          </div>

          {/* Info card */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
          >
            <div className="flex gap-2">
              <Sparkles size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-400 mb-1">Pro Tip</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use the AI buttons above to summarize long lessons, translate to Hindi or Gujarati,
                  or rewrite content for a specific grade before generating audio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
