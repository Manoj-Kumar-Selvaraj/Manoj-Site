import axios from 'axios'

// In development: Vite proxy rewrites /api → http://localhost:8000/api
// In production:  VITE_API_URL = http://<EC2-IP>/api  (set in GitHub Secrets)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
