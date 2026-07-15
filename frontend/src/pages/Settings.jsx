import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Settings as SettingsIcon, Volume2, Globe, Moon, Sun,
  Bell, HardDrive, Shield, Save, Loader2, Mic2, Zap,
} from 'lucide-react'

const VOICES = ['Rachel (English Female)', 'Adam (English Male)', 'Ananya (Hindi Female)', 'Arjun (Hindi Male)']
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil']
const AUDIO_QUALITIES = ['Standard (128 kbps)', 'High (192 kbps)', 'Lossless (320 kbps)']

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-slate-200 mb-5 flex items-center gap-2">
        <Icon size={16} className="text-indigo-400" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className="relative w-10 h-5 rounded-full transition-colors duration-200"
        style={{ background: checked ? '#4f46e5' : '#334155' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState({
    defaultVoice:   VOICES[0],
    defaultLanguage: LANGUAGES[0],
    audioQuality:   AUDIO_QUALITIES[0],
    notifyEmail:    true,
    notifyBrowser:  false,
    notifyDownload: true,
    autoSave:       true,
    publicHistory:  false,
  })

  const set = (key, val) => setSettings((p) => ({ ...p, [key]: val }))
  const toggle = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    localStorage.setItem('eduvoice_settings', JSON.stringify(settings))
    toast.success('Settings saved! ✅')
    setSaving(false)
  }

  const storageUsed = 24  // MB (demo)
  const storageMax  = 500 // MB

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Customize EduVoice AI to your workflow</p>
      </div>

      <div className="space-y-5">
        {/* Voice Defaults */}
        <Section title="Voice Defaults" icon={Volume2}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Voice</label>
              <select
                value={settings.defaultVoice}
                onChange={(e) => set('defaultVoice', e.target.value)}
                className="input-field"
              >
                {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => set('defaultLanguage', e.target.value)}
                className="input-field"
              >
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Audio Quality</label>
              <select
                value={settings.audioQuality}
                onChange={(e) => set('audioQuality', e.target.value)}
                className="input-field"
              >
                {AUDIO_QUALITIES.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Theme */}
        <Section title="Appearance" icon={theme === 'dark' ? Moon : Sun}>
          <div className="flex gap-3">
            {[
              { id: 'dark',  label: '🌙 Dark Mode' },
              { id: 'light', label: '☀️ Light Mode' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => id !== theme && toggleTheme()}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                  theme === id
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'border-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <div>
            <Toggle
              checked={settings.notifyEmail}
              onChange={() => toggle('notifyEmail')}
              label="Email Notifications"
              description="Receive email when audio generation is complete"
            />
            <Toggle
              checked={settings.notifyBrowser}
              onChange={() => toggle('notifyBrowser')}
              label="Browser Notifications"
              description="Desktop push notifications"
            />
            <Toggle
              checked={settings.notifyDownload}
              onChange={() => toggle('notifyDownload')}
              label="Download Ready Alerts"
              description="Notify when your audio file is ready to download"
            />
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Security" icon={Shield}>
          <div>
            <Toggle
              checked={settings.autoSave}
              onChange={() => toggle('autoSave')}
              label="Auto-Save Recordings"
              description="Automatically save generated audio to your history"
            />
            <Toggle
              checked={settings.publicHistory}
              onChange={() => toggle('publicHistory')}
              label="Public Audio History"
              description="Allow others to access shared audio links"
            />
          </div>
        </Section>

        {/* Storage */}
        <Section title="Storage Usage" icon={HardDrive}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-300">{storageUsed} MB used</span>
              <span className="text-sm text-slate-500">{storageMax} MB available</span>
            </div>
            <div className="w-full h-2 rounded-full mb-3" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(storageUsed / storageMax) * 100}%`,
                  background: 'linear-gradient(to right,#4f46e5,#34d399)',
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {storageMax - storageUsed} MB remaining on your current plan
            </p>
            <button className="btn-ghost text-xs text-red-400 hover:text-red-300 mt-3 px-0">
              🗑️ Clear all audio history to free space
            </button>
          </div>
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-3 px-8 glow-purple"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
