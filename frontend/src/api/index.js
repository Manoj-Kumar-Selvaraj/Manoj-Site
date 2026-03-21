import axios from 'axios'

// In development: Vite proxy rewrites /api → http://localhost:8000/api
// In production: prefer same-origin '/api' (CloudFront routes /api/* to Django).
// If VITE_API_URL is set, we normalize it and guard against mixed-content.

const DEFAULT_API_BASE = '/api'

function isLocalHostname(hostname) {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(String(hostname || '').toLowerCase())
}

function isAwsEc2Hostname(hostname) {
  return /^ec2-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}\..*\.compute(-\d+)?\.amazonaws\.com$/i.test(String(hostname || ''))
}

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

    if (typeof window !== 'undefined' && window.location) {
      const pageHost = window.location.hostname
      const apiHost = url.hostname
      const pageIsLocal = isLocalHostname(pageHost)
      const apiIsLocal = isLocalHostname(apiHost)

      // Production architecture expects the browser to call same-origin `/api`
      // through CloudFront/custom-domain routing. If an absolute API origin is
      // accidentally baked into the build and it points at a different host
      // (especially a raw EC2 hostname/IP), prefer the safe same-origin path.
      if (!pageIsLocal && url.origin !== window.location.origin) {
        return DEFAULT_API_BASE
      }

      // In local development, keep explicit localhost API URLs working.
      if (!pageIsLocal && !apiIsLocal && isAwsEc2Hostname(apiHost)) {
        return DEFAULT_API_BASE
      }
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
export const getFeaturedSkills= ()        => api.get('/skills/featured/')
export const getArchitectureEntries = ()   => api.get('/architecture/')
export const getCurrentFocusItems = ()     => api.get('/current-focus/')
export const getProjects      = (p = {})  => api.get('/projects/', { params: p })
export const getProject       = (slug)    => api.get(`/projects/${slug}/`)
export const getExperiences   = ()        => api.get('/experience/')
export const getBlogPosts     = (p = {})  => api.get('/blog/', { params: p })
export const getBlogPost      = (slug)    => api.get(`/blog/${slug}/`)
export const getActivities    = (p = {})  => api.get('/activities/', { params: p })
export const getCertifications= ()        => api.get('/certifications/')
export const sendContact      = (data)    => api.post('/contact/', data)

export default api
