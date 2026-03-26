import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getProfile } from '../api'
import { SectionHeaderSkeleton, TextBlockSkeleton } from './ui/Skeleton'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.6, ease: 'easeOut' },
})

export default function About() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeaderSkeleton />
        <TextBlockSkeleton lines={7} />
      </div>
    </section>
  )

  if (!profile) return null

  const bioText = String(profile?.bio_extended || profile?.bio || '')
  const bioParas = bioText
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)

  const aboutBadge = String(profile?.about_section_badge || 'About Me').trim() || 'About Me'
  const aboutHeadingPrefix = String(profile?.about_heading_prefix || 'Engineering cloud platforms').trim() || 'Engineering cloud platforms'
  const aboutHeadingHighlight = String(profile?.about_heading_highlight || 'with reliability first.').trim() || 'with reliability first.'
  const aboutIntro = String(profile?.about_section_intro || '').trim()

  return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div {...fadeUp(0)} className="mb-16">
          <span className="section-badge mb-4">{aboutBadge}</span>
          <h2 className="section-title mt-3">
            {aboutHeadingPrefix}<br />
            <span className="text-cobalt-600">{aboutHeadingHighlight}</span>
          </h2>
          {aboutIntro && (
            <p className="mt-3 text-ink-500 max-w-2xl">{aboutIntro}</p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-1 gap-12 items-start">

          {/* Bio / tooling details */}
          <motion.div {...fadeUp(0.1)} className="space-y-6">

            {/* Bio text */}
            <div className="space-y-4 text-ink-600 leading-relaxed text-base">
              {bioParas.map((para, i) => <p key={i}>{para}</p>)}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/#contact" className="btn-primary">Let's Talk</a>
              {profile?.resume && (
                <a href={profile.resume} download className="btn-outline">Download CV</a>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

