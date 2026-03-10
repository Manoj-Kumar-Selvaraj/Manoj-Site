import axios from 'axios'

// In development: Vite proxy rewrites /api → http://localhost:8000/api
// In production: prefer same-origin '/api' (CloudFront routes /api/* to Django).
// If VITE_API_URL is set, we normalize it and guard against mixed-content.

const DEFAULT_API_BASE = '/api'

function normalizeApiBase(raw) {
  const value = String(raw || '').trim()
  if (!value) return DEFAULT_API_BASE

  // If the site is served over HTTPS, an explicit http:// API URL will be
  // blocked by browsers (mixed content). Fall back to same-origin.
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && value.startsWith('http://')) {
    return DEFAULT_API_BASE
  }

  // Allow same-origin paths.
  if (value.startsWith('/')) {
    if (value === '/' || value === '/api' || value === '/api/') return DEFAULT_API_BASE
    return value
  }

  // If a full origin is provided (e.g. https://example.com), ensure it targets /api.
  try {
    const url = new URL(value)
    const path = url.pathname.replace(/\/+$/, '')
    if (!path || path === '/') {
      url.pathname = '/api'
    } else if (!path.endsWith('/api')) {
      url.pathname = `${path}/api`
    }
    return url.toString().replace(/\/+$/, '')
  } catch {
    // Unknown format — safest fallback.
    return DEFAULT_API_BASE
  }
}

const apiBaseURL = normalizeApiBase(import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
})

export const getProfile       = ()        => api.get('/profile/me/')
export const getSkillsGrouped = ()        => api.get('/skills/grouped/')
export const getProjects      = (p = {})  => api.get('/projects/', { params: p })
export const getProject       = (slug)    => api.get(`/projects/${slug}/`)
export const getExperiences   = ()        => api.get('/experience/')
export const getBlogPosts     = (p = {})  => api.get('/blog/', { params: p })
export const getBlogPost      = (slug)    => api.get(`/blog/${slug}/`)
export const getActivities    = (p = {})  => api.get('/activities/', { params: p })
export const getCertifications= ()        => api.get('/certifications/')
export const sendContact      = (data)    => api.post('/contact/', data)

export default api
