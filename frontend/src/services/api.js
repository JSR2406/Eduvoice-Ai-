import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduvoice_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('eduvoice_is_guest') !== 'true') {
      localStorage.removeItem('eduvoice_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

const isGuest = () => localStorage.getItem('eduvoice_is_guest') === 'true'

// ── Voice endpoints ──────────────────────────────────────
export const fetchVoices = () => api.get('/voices')

// ── Audio generation ─────────────────────────────────────
export const generateAudio = async (payload) => {
  if (isGuest()) {
    // Strip user_id/save_to_history for backend request
    const backendPayload = { ...payload }
    delete backendPayload.user_id
    delete backendPayload.save_to_history

    const response = await api.post('/generate-audio', backendPayload, {
      responseType: 'blob',
      timeout: 120000,
    })

    if (payload.save_to_history) {
      try {
        const blob = new Blob([response.data], { type: 'audio/mpeg' })
        const localUrl = URL.createObjectURL(blob)
        
        // Find voice name
        let voiceName = payload.voice_id
        if (payload.voice_id === 'rachel') voiceName = 'Rachel (English Female)'
        else if (payload.voice_id === 'adam') voiceName = 'Adam (English Male)'
        else if (payload.voice_id === 'ananya') voiceName = 'Ananya (Hindi Female)'
        else if (payload.voice_id === 'arjun') voiceName = 'Arjun (Hindi Male)'

        const historyItem = {
          id: `guest-hist-${Date.now()}`,
          user_id: 'guest',
          title: payload.title || 'Untitled Audio',
          text_content: payload.text,
          audio_url: localUrl,
          voice_id: payload.voice_id,
          voice_name: voiceName,
          language: payload.language,
          provider: 'edge',
          duration_secs: Math.max(1, Math.round(payload.text.trim().split(/\s+/).length / 2.5)),
          created_at: new Date().toISOString(),
          is_favorite: false
        }

        const history = JSON.parse(localStorage.getItem('eduvoice_guest_history') || '[]')
        history.unshift(historyItem)
        localStorage.setItem('eduvoice_guest_history', JSON.stringify(history))
      } catch (e) {
        console.warn('Failed to save to guest history', e)
      }
    }
    return response
  }

  return api.post('/generate-audio', payload, {
    responseType: 'blob',
    timeout: 120000,
  })
}

// ── AI endpoints ──────────────────────────────────────────
export const summarizeText = (payload) => api.post('/summarize', payload)
export const translateText = (payload) => api.post('/translate', payload)
export const rewriteForGrade = (payload) => api.post('/rewrite', payload)
export const generateHomework = (data) => api.post('/generate-homework', data)
export const generateAnnouncement = (data) => api.post('/generate-announcement', data)
export const generateRevision = (data) => api.post('/generate-revision', data)
export const generateReading = (data) => api.post('/generate-reading', data)
export const generateAssembly = (data) => api.post('/generate-assembly', data)
export const generateLesson = (data) => api.post('/generate-lesson', data)
export const generateStory = (data) => api.post('/generate-story', data)
export const generateQuiz = (data) => api.post('/generate-quiz', data)
export const generateDebate = (data) => api.post('/generate-debate', data)
export const chatWithAssistant = (payload) => api.post('/chat', payload)

// ── PDF upload ───────────────────────────────────────────
export const uploadPDF = (formData) => api.post('/upload-pdf', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 120000,
})

// ── History endpoints ─────────────────────────────────────
export const getHistory = (params) => {
  if (isGuest()) {
    let items = JSON.parse(localStorage.getItem('eduvoice_guest_history') || '[]')
    
    if (params.q) {
      items = items.filter(i => i.title?.toLowerCase().includes(params.q.toLowerCase()))
    }
    if (params.language) {
      items = items.filter(i => i.language === params.language)
    }
    if (params.favorites) {
      items = items.filter(i => i.is_favorite)
    }

    if (params.sort_by === 'created_at') {
      items.sort((a, b) => params.sort_dir === 'desc' 
        ? new Date(b.created_at) - new Date(a.created_at) 
        : new Date(a.created_at) - new Date(b.created_at)
      )
    } else if (params.sort_by === 'title') {
      items.sort((a, b) => params.sort_dir === 'desc'
        ? b.title.localeCompare(a.title)
        : a.title.localeCompare(b.title)
      )
    } else if (params.sort_by === 'duration') {
      items.sort((a, b) => params.sort_dir === 'desc'
        ? b.duration_secs - a.duration_secs
        : a.duration_secs - b.duration_secs
      )
    }

    const page = params.page || 1
    const limit = params.limit || 10
    const total = items.length
    const start = (page - 1) * limit
    const paginated = items.slice(start, start + limit)
    
    return Promise.resolve({ data: { items: paginated, total } })
  }
  return api.get('/history', { params })
}

export const deleteHistory = (id) => {
  if (isGuest()) {
    let items = JSON.parse(localStorage.getItem('eduvoice_guest_history') || '[]')
    items = items.filter(i => i.id !== id)
    localStorage.setItem('eduvoice_guest_history', JSON.stringify(items))
    return Promise.resolve({ data: { success: true } })
  }
  return api.delete(`/history/${id}`)
}

export const updateHistory = (id, payload) => {
  if (isGuest()) {
    let items = JSON.parse(localStorage.getItem('eduvoice_guest_history') || '[]')
    let updatedItem = null
    items = items.map(i => {
      if (i.id === id) {
        updatedItem = { ...i, ...payload }
        return updatedItem
      }
      return i
    })
    localStorage.setItem('eduvoice_guest_history', JSON.stringify(items))
    return Promise.resolve({ data: { success: true, item: updatedItem } })
  }
  return api.patch(`/history/${id}`, payload)
}

// ── Templates endpoints ───────────────────────────────────
export const getTemplates = () => {
  if (isGuest()) {
    const custom = JSON.parse(localStorage.getItem('eduvoice_guest_templates') || '[]')
    return Promise.resolve({ data: { templates: custom } })
  }
  return api.get('/templates')
}

export const createTemplate = (payload) => {
  if (isGuest()) {
    const custom = JSON.parse(localStorage.getItem('eduvoice_guest_templates') || '[]')
    const newTpl = {
      id: `guest-tpl-${Date.now()}`,
      user_id: 'guest',
      created_at: new Date().toISOString(),
      ...payload,
    }
    custom.unshift(newTpl)
    localStorage.setItem('eduvoice_guest_templates', JSON.stringify(custom))
    return Promise.resolve({ data: { template: newTpl } })
  }
  return api.post('/templates', payload)
}

export const updateTemplate = (id, payload) => {
  if (isGuest()) {
    let custom = JSON.parse(localStorage.getItem('eduvoice_guest_templates') || '[]')
    let updated = null
    custom = custom.map(t => {
      if (t.id === id) {
        updated = { ...t, ...payload }
        return updated
      }
      return t
    })
    localStorage.setItem('eduvoice_guest_templates', JSON.stringify(custom))
    return Promise.resolve({ data: { template: updated } })
  }
  return api.patch(`/templates/${id}`, payload)
}

export const deleteTemplate = (id) => {
  if (isGuest()) {
    let custom = JSON.parse(localStorage.getItem('eduvoice_guest_templates') || '[]')
    custom = custom.filter(t => t.id !== id)
    localStorage.setItem('eduvoice_guest_templates', JSON.stringify(custom))
    return Promise.resolve({ data: { success: true } })
  }
  return api.delete(`/templates/${id}`)
}

export default api
