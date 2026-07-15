import React from 'react'
import { Mic2 } from 'lucide-react'

const bars = [4, 8, 12, 16, 12, 8, 4, 8, 12, 16, 12, 8]

export default function LoadingScreen({ message = 'Loading EduVoice AI…' }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{ background: '#0d0d1a' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #34d399)' }}
        >
          <Mic2 className="text-white" size={24} />
        </div>
        <span
          className="text-xl font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span className="gradient-text">EduVoice</span>
          <span className="text-slate-300"> AI</span>
        </span>
      </div>

      {/* Waveform */}
      <div className="flex items-end gap-1 h-10">
        {bars.map((h, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${h}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <p className="text-slate-400 text-sm animate-pulse">{message}</p>
    </div>
  )
}
