import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Mic2, Mail, Lock, Eye, EyeOff, Loader2, User, School, CheckCircle,
} from 'lucide-react'

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const strength = checks.filter((c) => c.pass).length
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i < strength ? colors[strength - 1] : '#334155' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(({ label, pass }) => (
            <span key={label} className={`text-xs ${pass ? 'text-emerald-400' : 'text-slate-600'}`}>
              {label}
            </span>
          ))}
        </div>
        {strength > 0 && (
          <span className="text-xs font-medium" style={{ color: colors[strength - 1] }}>
            {labels[strength - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signUp, signInWithGoogle, signInGuest } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password', '')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await signUp({ email: data.email, password: data.password, fullName: data.fullName, school: data.school })
      toast.success('Account created! Check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed.')
      setGoogleLoading(false)
    }
  }

  const handleGuest = () => {
    signInGuest()
    navigate('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-10"
      style={{ background: 'radial-gradient(ellipse at top, rgba(79,70,229,0.1) 0%, #0d0d1a 60%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}
            >
              <Mic2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <span className="gradient-text">EduVoice</span>
              <span className="text-slate-300"> AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 mb-2">Create your account</h1>
          <p className="text-slate-500 text-sm">Free forever. No credit card needed.</p>
        </div>

        <div className="card p-8">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-secondary w-full justify-center mb-3 py-2.5"
          >
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Guest Mode */}
          <button
            onClick={handleGuest}
            type="button"
            className="btn-secondary w-full justify-center mb-6 py-2.5 border-dashed border-indigo-500/50 hover:bg-indigo-600/10 text-indigo-300"
          >
            🚀 Test Platform without Login
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-500">
              <span className="px-3" style={{ background: '#1e1e2e' }}>or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Ms. Priya Sharma"
                  className="input-field pl-9"
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">School / Institution</label>
              <div className="relative">
                <School size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-school"
                  type="text"
                  placeholder="Delhi Public School"
                  className="input-field pl-9"
                  {...register('school')}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="teacher@school.edu"
                  className="input-field pl-9"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="input-field pl-9 pr-10"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="reg-terms"
                type="checkbox"
                className="mt-0.5 accent-indigo-500"
                {...register('terms', { required: 'Please accept the terms' })}
              />
              <label htmlFor="reg-terms" className="text-xs text-slate-400">
                I agree to the{' '}
                <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

            <button
              type="submit"
              id="reg-submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
