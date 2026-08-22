import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return
    if (userId === 'guest') {
      setProfile({ id: 'guest', full_name: 'Guest Educator', school: 'VoxGuru Demo School', email: 'guest@voxguru.ai' })
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [])

  useEffect(() => {
    const isGuestSession = localStorage.getItem('voxguru_is_guest') === 'true'
    if (isGuestSession) {
      setUser({ id: 'guest', email: 'guest@voxguru.ai', user_metadata: { full_name: 'Guest Educator' }, isGuest: true })
      setProfile({ id: 'guest', full_name: 'Guest Educator', school: 'VoxGuru Demo School', email: 'guest@voxguru.ai' })
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (localStorage.getItem('voxguru_is_guest') === 'true') return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        localStorage.setItem('voxguru_token', session.access_token)
        loadProfile(u.id)
      }
      setLoading(false)
    }).catch(err => {
      console.warn('Supabase auth error:', err)
      if (!localStorage.getItem('voxguru_is_guest') === 'true') setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem('voxguru_is_guest') === 'true') return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        localStorage.setItem('voxguru_token', session.access_token)
        loadProfile(u.id)
      } else {
        localStorage.removeItem('voxguru_token')
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signUp = async ({ email, password, fullName, school }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, school },
      },
    })
    if (error) throw error
    return data
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  }

  const signInGuest = () => {
    localStorage.setItem('voxguru_is_guest', 'true')
    setUser({ id: 'guest', email: 'guest@voxguru.ai', user_metadata: { full_name: 'Guest Educator' }, isGuest: true })
    setProfile({ id: 'guest', full_name: 'Guest Educator', school: 'VoxGuru Demo School', email: 'guest@voxguru.ai' })
    toast.success('Signed in as Guest! 🚀')
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  const signOut = async () => {
    if (localStorage.getItem('voxguru_is_guest') === 'true') {
      localStorage.removeItem('voxguru_is_guest')
      setUser(null)
      setProfile(null)
      toast.success('Signed out successfully')
      return
    }
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
  }

  const updateProfile = async (updates) => {
    if (!user) return
    if (user.isGuest) {
      const data = { ...profile, ...updates }
      setProfile(data)
      return data
    }
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signInWithGoogle, signInGuest,
      resetPassword, updatePassword,
      signOut, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
