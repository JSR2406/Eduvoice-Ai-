import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Mic2, Sparkles, Zap, Globe, BookOpen, FileText,
  CheckCircle, ChevronRight, Star, Play, ArrowRight,
  Users, Clock, Download, Headphones, Shield, Award,
} from 'lucide-react'

const features = [
  { icon: Mic2,       title: 'AI Voice Generation',     desc: 'Natural-sounding voices in 5+ Indian languages using ElevenLabs API.' },
  { icon: Sparkles,   title: 'AI Smart Enhancer',    desc: 'Summarize chapters, rewrite for any grade level, and create revision notes.' },
  { icon: Globe,      title: 'Multi-Language Support',  desc: 'Generate audio in English, Hindi, Marathi, Gujarati, and Tamil.' },
  { icon: BookOpen,   title: 'Smart Templates',         desc: 'Morning assembly, homework, announcements, reading practice — ready to use.' },
  { icon: FileText,   title: 'PDF Upload & Extract',    desc: 'Upload your PDF textbook and get instant audio summaries.' },
  { icon: Download,   title: 'Download & Share',        desc: 'MP3 download, WhatsApp sharing, QR codes, and Google Classroom links.' },
]

const howItWorks = [
  { step: '01', title: 'Type or Upload',      desc: 'Type your lesson content or upload a PDF — EduVoice extracts and understands it.' },
  { step: '02', title: 'AI Enhances It',      desc: 'Our AI summarizes, rewrites for grade level, or translates your content.' },
  { step: '03', title: 'Generate Audio',      desc: 'Choose voice, language, speed and emotion, then generate natural AI speech.' },
  { step: '04', title: 'Share Instantly',     desc: 'Download MP3, copy a link, generate QR, or share via WhatsApp in seconds.' },
]

const testimonials = [
  { name: 'Priya Sharma',     role: 'Science Teacher, Delhi',    text: 'EduVoice AI saves me 3 hours every week. My students love the audio lessons!', rating: 5 },
  { name: 'Rajesh Nair',      role: 'Principal, Mumbai School',  text: 'Morning assembly scripts are now done in 2 minutes. Game changer for our school.', rating: 5 },
  { name: 'Meena Patel',      role: 'English Teacher, Ahmedabad',text: 'The Hindi and Gujarati voice quality is incredible. Perfect for regional language classes.', rating: 5 },
]

const pricing = [
  {
    name: 'Starter', price: '₹0', period: '/month', highlight: false,
    features: ['10 Audio Generations/month', '5 AI requests', '2 Languages', '100MB Storage', 'Basic Templates'],
  },
  {
    name: 'Teacher', price: '₹499', period: '/month', highlight: true,
    features: ['200 Audio Generations/month', 'Unlimited AI', 'All 5 Languages', '5GB Storage', 'All Templates', 'PDF Upload', 'Priority Support'],
  },
  {
    name: 'School', price: '₹1999', period: '/month', highlight: false,
    features: ['Unlimited Generations', 'Unlimited AI', 'All Languages', 'Unlimited Storage', 'Custom Templates', 'Google Classroom', 'Dedicated Support'],
  },
]

const BARS = Array.from({ length: 24 }, (_, i) => ({
  h: 8 + Math.random() * 40,
  delay: i * 0.08,
}))

export default function Landing() {
  const waveRef = useRef(null)

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1a', color: '#e2e8f0' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4"
        style={{ background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}
          >
            <Mic2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <span className="gradient-text">EduVoice</span>
            <span className="text-slate-300"> AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login?guest=true" className="btn-ghost text-sm text-indigo-300 hover:text-indigo-200 hidden sm:inline-block">Test as Guest</Link>
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 lg:py-36 px-6 lg:px-12 text-center">
        {/* Background glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 badge mb-6 px-4 py-2 text-xs"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <Sparkles size={12} />
            Powered by ElevenLabs + OpenRouter AI
          </div>

          <h1
            className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            Turn Your Lessons Into
            <br />
            <span className="gradient-text">Natural AI Audio</span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            EduVoice AI helps teachers convert text into professional-sounding audio for lessons,
            announcements, homework, and more — in 5 Indian languages.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              to="/register"
              className="btn-primary text-base py-3 px-8 glow-purple"
            >
              <Zap size={18} />
              Start Free — No Credit Card
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base py-3 px-8">
              <Play size={18} />
              See How It Works
            </a>
          </div>
          <p className="text-sm text-slate-500 mb-16">
            Want to try it first?{' '}
            <Link to="/login?guest=true" className="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-indigo-500/50 decoration-2 underline-offset-4">
              Test the platform without login →
            </Link>
          </p>

          {/* Animated Waveform Demo */}
          <div
            className="mx-auto max-w-xl rounded-2xl p-6 glass"
            style={{ border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full" style={{ background: '#34d399' }} />
              <span className="text-xs text-slate-500 ml-2">EduVoice AI — Live Preview</span>
            </div>
            <div className="flex items-end gap-1 h-16 justify-center mb-4">
              {BARS.map((b, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{ height: `${b.h}px`, animationDelay: `${b.delay}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center">
              "Good morning students! Today we will learn about the water cycle…"
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-6 lg:px-12 border-y" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Teachers' },
            { value: '5 Lakh+', label: 'Audio Generated' },
            { value: '5',       label: 'Indian Languages' },
            { value: '99.9%',   label: 'Uptime' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold gradient-text mb-1">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Everything a Teacher Needs
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From AI-powered voice generation to smart content enhancement — all in one place.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card group cursor-default">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(99,102,241,0.15)' }}
                >
                  <Icon size={20} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12" style={{ background: 'rgba(15,15,28,0.6)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              How It Works
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {howItWorks.map(({ step, title, desc }) => (
              <div key={step} className="card flex gap-4">
                <div
                  className="text-3xl font-black shrink-0 gradient-text"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}
                >
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Loved by Teachers Across India
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="card">
                <div className="flex mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 lg:px-12" style={{ background: 'rgba(15,15,28,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Simple, Honest Pricing
            </h2>
            <p className="text-slate-400">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, period, highlight, features: fs }) => (
              <div
                key={name}
                className={`card flex flex-col ${highlight ? 'glow-purple border-indigo-500/40' : ''}`}
                style={highlight ? { border: '1px solid rgba(99,102,241,0.4)' } : {}}
              >
                {highlight && (
                  <div
                    className="badge text-xs self-start mb-3"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 className="font-bold text-lg text-slate-100 mb-1">{name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold gradient-text">{price}</span>
                  <span className="text-slate-500 text-sm">{period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {fs.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={highlight ? 'btn-primary justify-center' : 'btn-secondary justify-center'}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 lg:px-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-6" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join 10,000+ teachers already saving time with EduVoice AI.
          </p>
          <Link to="/register" className="btn-primary text-base py-3 px-10 glow-purple">
            <Zap size={18} />
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 px-6 lg:px-12 text-center text-slate-600 text-sm border-t"
        style={{ borderColor: 'rgba(99,102,241,0.1)' }}
      >
        <p>© 2025 EduVoice AI. Built with ❤️ for Teachers across India.</p>
      </footer>
    </div>
  )
}
