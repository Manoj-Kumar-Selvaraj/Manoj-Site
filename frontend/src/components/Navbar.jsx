import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github, Linkedin, Mail, PhoneCall } from 'lucide-react'
import { getProfile } from '../api'

const navLinks = [
  { label: 'About',      href: '/#about' },
  { label: 'Skills',     href: '/#skills' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects',   href: '/projects' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Activities', href: '/activities' },
  { label: 'Contact',    href: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location])

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const brand = String(profile?.name || 'Portfolio').trim() || 'Portfolio'
  const brandShort = brand.split(' ').slice(0, 2).join(' ') || brand
  const github = String(profile?.github_url || '').trim()
  const linkedin = String(profile?.linkedin_url || '').trim()
  const email = String(profile?.email || '').trim()
  const phone = String(profile?.phone || '').trim()

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-lg border-b border-ink-200 shadow-card'
          : 'bg-surface/70 backdrop-blur-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            title={brand}
            aria-label={`Account: ${brand}`}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-cobalt-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">MK</span>
            </div>
            <span className="font-black text-ink-900 tracking-tight group-hover:text-cobalt-600 transition-colors hidden min-[1200px]:inline">
              {brand}
            </span>
            <span className="font-black text-ink-900 tracking-tight group-hover:text-cobalt-600 transition-colors min-[1200px]:hidden">
              {brandShort}
            </span>

            {/* Small contact icons near brand */}
            <div className="hidden min-[1200px]:flex items-center gap-1.5 ml-2">
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-white/50 border border-white/60 backdrop-blur
                             flex items-center justify-center text-ink-700
                             hover:text-cobalt-700 hover:bg-white/70 hover:border-cobalt-200 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin size={16} />
                </a>
              )}
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                  className="w-8 h-8 rounded-lg bg-white/50 border border-white/60 backdrop-blur
                             flex items-center justify-center text-ink-700
                             hover:text-cobalt-700 hover:bg-white/70 hover:border-cobalt-200 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={16} />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label="Email"
                  title={email}
                  className="w-8 h-8 rounded-lg bg-white/50 border border-white/60 backdrop-blur
                             flex items-center justify-center text-ink-700
                             hover:text-cobalt-700 hover:bg-white/70 hover:border-cobalt-200 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={16} />
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  aria-label="Call"
                  title={phone}
                  className="w-8 h-8 rounded-lg bg-white/50 border border-white/60 backdrop-blur
                             flex items-center justify-center text-ink-700
                             hover:text-cobalt-700 hover:bg-white/70 hover:border-cobalt-200 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PhoneCall size={16} />
                </a>
              )}
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden min-[960px]:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-2 py-1.5 rounded-lg text-xs text-ink-800 font-medium
                           bg-white/50 border border-white/60 backdrop-blur
                           hover:text-cobalt-700 hover:bg-white/70 hover:border-cobalt-200 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
            <a href="/#contact" className="ml-2 btn-primary text-xs py-1.5 px-4">
              Hire Me
            </a>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="min-[960px]:hidden p-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-all"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="min-[960px]:hidden absolute right-4 left-auto top-16 mt-2
                       w-56 max-w-[calc(100vw-2rem)]
                       bg-surface/95 backdrop-blur-lg border border-ink-200
                       shadow-card-md rounded-2xl overflow-hidden"
          >
            <div className="px-3 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2 rounded-xl text-ink-700 font-medium
                             hover:text-cobalt-600 hover:bg-cobalt-50 transition-all"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/#contact"
                className="block px-3 py-2 rounded-xl font-semibold text-center
                           bg-cobalt-600 text-white hover:bg-cobalt-500 transition-all"
                onClick={() => setOpen(false)}
              >
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
