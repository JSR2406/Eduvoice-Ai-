import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  User, School, BookOpen, Globe, Mic2, Camera,
  Save, Loader2, Mail, Phone, MapPin,
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science', 'Art', 'Physical Education']
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil']

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const fileRef = useRef(null)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      full_name:          profile?.full_name || user?.user_metadata?.full_name || '',
      school:             profile?.school || '',
      phone:              profile?.phone || '',
      city:               profile?.city || '',
      subjects:           profile?.subjects || [],
      preferred_language: profile?.preferred_language || 'English',
      bio:                profile?.bio || '',
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await updateProfile(data)
      toast.success('Profile updated! ✅')
    } catch (err) {
      toast.error(err.message || 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      
      if (user?.isGuest) {
         toast.success('Avatar preview updated! (Guest mode)')
         return
      }
      
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        await updateProfile({ avatar_url: data.publicUrl })
        toast.success('Avatar uploaded successfully! ✅')
      } catch (err) {
        toast.error('Error uploading avatar: ' + err.message)
      }
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Teacher'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          My Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your teacher profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}
              >
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#4f46e5' }}
            >
              <Camera size={14} className="text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{displayName}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-600 mt-2">Click camera icon to change photo</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <User size={16} className="text-indigo-400" />
            Basic Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="Ms. Priya Sharma"
                  {...register('full_name', { required: 'Name is required' })}
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">School / Institution</label>
              <div className="relative">
                <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="Delhi Public School"
                  {...register('school')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  className="input-field pl-9"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">City</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="Mumbai, Maharashtra"
                  {...register('city')}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Tell students and parents about yourself…"
              {...register('bio')}
            />
          </div>
        </div>

        {/* Teaching Preferences */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" />
            Teaching Preferences
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">Subjects You Teach</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input
                    type="checkbox"
                    value={s}
                    className="hidden"
                    {...register('subjects')}
                  />
                  <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-medium border transition-all" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)', color: '#94a3b8' }}>
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred Language for Audio</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select className="input-field pl-9" {...register('preferred_language')}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Mail size={16} className="text-indigo-400" />
            Account
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="input-field opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed here. Contact support.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary py-3 px-8 glow-purple"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
