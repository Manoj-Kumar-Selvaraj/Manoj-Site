import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { getProfile } from '../api'

function PhotoBlock({ profile, name }) {
  return (
    <div className="relative">
      <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-56 lg:h-56 rounded-3xl overflow-hidden
                      border border-white/70
                      bg-white/60 backdrop-blur-md
                      flex items-center justify-center shadow-xl">
        {profile?.avatar ? (
          <img src={profile.avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-500 px-4 text-center">
            <Camera size={28} className="text-ink-400" />
            <span className="text-xs leading-snug">Add photo via Admin</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Hero() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const name     = profile?.name || ''
  const title    = profile?.title || ''
  const tagline  = profile?.tagline || ''

  const intro = String(profile?.bio || '')
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 2)

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden hero-section pt-16 sm:pt-20">

      {/* Photo — top-right, desktop/tablet */}
      <motion.div
        className="absolute top-24 right-6 sm:right-10 lg:right-20 z-20 hidden sm:block"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
      >
        <PhotoBlock profile={profile} name={name} />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:pr-56 md:pr-64 lg:pr-80">

          {/* Title + story glass card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="bg-white/70 backdrop-blur-lg rounded-3xl px-7 py-6
                       shadow-xl border border-white/50 mb-4 w-full"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-ink-900 leading-snug">
              {title || 'Portfolio'}
            </h1>
            {tagline && (
              <div className="mt-2 text-xs sm:text-sm font-semibold text-ink-600">
                {tagline}
              </div>
            )}

            {intro.length > 0 && (
              <div className="mt-4 space-y-3 text-sm sm:text-base text-ink-700 leading-relaxed">
                {intro.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </motion.div>

          {/* Mobile photo — below links */}
          <motion.div
            className="sm:hidden mt-10 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <PhotoBlock profile={profile} name={name} />
          </motion.div>

        </div>
      </div>

    </section>
  )
}
