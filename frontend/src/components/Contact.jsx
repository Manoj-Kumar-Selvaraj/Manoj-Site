import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle, AlertCircle, MapPin } from 'lucide-react'
import { getProfile, sendContact } from '../api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again.')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const contactEmail = profile?.email || ''
  const location = profile?.location || ''
  const isAvailable = Boolean(profile?.is_available)
  const sectionBadge = String(profile?.contact_section_badge || 'Contact').trim() || 'Contact'
  const sectionTitle = String(profile?.contact_section_title || "Let's Work Together").trim() || "Let's Work Together"
  const sectionIntro = String(profile?.contact_section_intro || "Send a message and I'll get back to you.").trim()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('Something went wrong. Please try again.')
    try {
      await sendContact(form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      if (err?.response?.status === 429) {
        setErrorMessage('Too many messages in a short time. Please try again later.')
      }
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 bg-canvas">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">{sectionBadge}</span>
          <h2 className="section-title mt-3">{sectionTitle}</h2>
          {sectionIntro && (
            <p className="mt-3 text-ink-500 max-w-xl">{sectionIntro}</p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Contact details card */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cobalt-50 border border-cobalt-200 flex items-center justify-center">
                  <Mail size={18} className="text-cobalt-600" />
                </div>
                <div>
                  <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Email</p>
                  <p className="text-sm text-ink-700 font-semibold">{contactEmail}</p>
                </div>
              </div>

              {location && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <MapPin size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-400 uppercase tracking-wide font-medium">Location</p>
                    <p className="text-sm text-ink-700 font-semibold">{location}</p>
                  </div>
                </div>
              )}

              {isAvailable && (
                <div className="flex items-center gap-2 pt-3 border-t border-ink-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                  <span className="text-emerald-700 text-sm font-semibold">Available</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="card rounded-2xl p-6 md:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-ink-400 uppercase tracking-wide font-medium mb-1.5">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 uppercase tracking-wide font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-ink-400 uppercase tracking-wide font-medium mb-1.5">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Project collaboration / Job opportunity"
                  className="field"
                />
              </div>

              <div>
                <label className="block text-xs text-ink-400 uppercase tracking-wide font-medium mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell me about your project or opportunity..."
                  className="field resize-none"
                />
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  Message sent! I'll get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send size={15} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
