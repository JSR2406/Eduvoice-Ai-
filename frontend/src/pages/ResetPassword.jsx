import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mic2, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password', '')

  const onSubmit = async ({ password: newPw }) => {
    setLoading(true)
    try {
      await updatePassword(newPw)
      setDone(true)
      toast.success('Password updated!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error(err.message || 'Failed to update password.')
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
              <span className="gradient-text">EduVoice</span><span className="text-slate-300"> AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 mb-2">Set New Password</h1>
        </div>

        <div className="card p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(52,211,153,0.15)' }}>
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-100 mb-2">Password Updated!</h2>
              <p className="text-slate-400 text-sm">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    className="input-field pl-9 pr-10"
                    {...register('password', { required: 'Required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="reset-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className="input-field pl-9"
                    {...register('confirm', {
                      required: 'Required',
                      validate: (v) => v === password || 'Passwords do not match',
                    })}
                  />
                </div>
                {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm.message}</p>}
              </div>

              <button type="submit" id="reset-submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
