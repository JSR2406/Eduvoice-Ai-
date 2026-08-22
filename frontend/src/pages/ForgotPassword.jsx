import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mic2, Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at top, rgba(79,70,229,0.1) 0%, #0d0d1a 60%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}>
              <Mic2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <span className="gradient-text">VoxGuru</span><span className="text-slate-300"> AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm">Enter your email and we'll send a reset link</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(52,211,153,0.15)' }}>
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-100 mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a password reset link. Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center py-2.5">
                <ArrowLeft size={15} />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="forgot-email"
                    type="email"
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

              <button type="submit" id="forgot-submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <p className="text-center text-sm text-slate-500">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  ← Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
