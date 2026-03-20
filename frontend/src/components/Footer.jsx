import { useEffect, useState } from 'react'
import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react'
import { getFeaturedSkills, getProfile } from '../api'

const NAV_LINKS = [
  { label: 'About',      href: '/#about' },
  { label: 'Toolkit',    href: '/#hero-toolkit' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects',   href: '/projects' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Contact',    href: '/#contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [profile, setProfile] = useState(null)
  const [featuredSkills, setFeaturedSkills] = useState([])

  useEffect(() => {
    Promise.all([getProfile(), getFeaturedSkills()])
      .then(([profileRes, skillsRes]) => {
        setProfile(profileRes.data)
        setFeaturedSkills(Array.isArray(skillsRes.data) ? skillsRes.data : [])
      })
      .catch(() => {})
  }, [])

  const title = profile?.title || ''
  const github = profile?.github_url || ''
  const linkedin = profile?.linkedin_url || ''
  const email = profile?.email || ''
  const location = profile?.location || ''
  const isAvailable = Boolean(profile?.is_available)
  const name = profile?.name || ''
  const stackSummary = featuredSkills.slice(0, 5).map(s => s.name).join(' · ')

  return (
    <footer className="bg-ink-900 text-ink-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-ink-700">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cobalt-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">MK</span>
              </div>
              <span className="font-black text-white tracking-tight">
                Manoj<span className="text-cobalt-400">.</span>dev
              </span>
            </div>
            <p className="text-sm text-ink-500 leading-relaxed max-w-xs">
              {title}
            </p>
            <div className="flex items-center gap-3 mt-5">
              {github && (
                <a href={github} target="_blank" rel="noreferrer"
                   className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-cobalt-600 transition-colors">
                  <Github size={15} className="text-ink-400" />
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer"
                   className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-cobalt-600 transition-colors">
                  <Linkedin size={15} className="text-ink-400" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                   className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-cobalt-600 transition-colors">
                  <Mail size={15} className="text-ink-400" />
                </a>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-widest font-semibold mb-4">Navigation</p>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <a href={link.href}
                     className="text-sm text-ink-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick info */}
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-widest font-semibold mb-4">Quick Info</p>
            <ul className="space-y-2.5 text-sm text-ink-400">
              {location && <li>{location}</li>}
              {email && <li>{email}</li>}
              {isAvailable && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  Available
                </li>
              )}
            </ul>
            <div className="mt-5">
              <p className="text-xs text-ink-500 uppercase tracking-widest font-semibold mb-2">Stack</p>
              <p className="text-xs text-ink-400 leading-relaxed">{stackSummary || 'Curate hero tools in admin to show stack summary.'}</p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-ink-500">
            © {year}{name ? ` ${name}` : ''} — All rights reserved
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-xs text-ink-400 hover:text-white transition-colors"
          >
            <ArrowUp size={12} />
            Back to top
          </button>
        </div>

      </div>
    </footer>
  )
}
