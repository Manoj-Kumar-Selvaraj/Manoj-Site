import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getProfile } from '../api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.6, ease: 'easeOut' },
})

function StatCard({ value, label, index }) {
  const [visible, setVisible] = useState(false)
  const [count, setCount] = useState(0)

  const numStr = String(value)
  const numericPart = parseInt(numStr.replace(/[^0-9]/g, ''), 10) || 0
  const suffix = numStr.replace(/[0-9]/g, '').trim()
  const hasNumber = numericPart > 0

  useEffect(() => {
    if (!visible || !hasNumber) return
    const duration = 1400
    let startTime = null
    let rafId
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setCount(Math.floor(eased * numericPart))
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        setCount(numericPart)
      }
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [visible, hasNumber, numericPart])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setVisible(true)}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card relative overflow-hidden p-5 text-center group hover:-translate-y-1 hover:shadow-card-md transition-all duration-300 cursor-default"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cobalt-400 to-cobalt-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <div className="text-3xl font-black text-cobalt-600 tabular-nums leading-none">
        {hasNumber ? count : value}{hasNumber ? suffix : ''}
      </div>
      <div className="text-[11px] font-semibold text-ink-400 uppercase tracking-widest mt-2">{label}</div>
    </motion.div>
  )
}

export default function About() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  if (!profile) return null

  const bioText = String(profile?.bio_extended || profile?.bio || '')
  const bioParas = bioText
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)

  const dynamicStats = Array.isArray(profile?.stats) ? profile.stats : []
  const statCards = [
    ...(profile?.years_experience > 0
      ? [{ value: `${profile.years_experience}+`, label: 'Years in tech' }]
      : []),
    ...(profile?.projects_completed > 0
      ? [{ value: `${profile.projects_completed}+`, label: 'Projects' }]
      : []),
    ...dynamicStats
      .slice()
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .map(s => ({ value: String(s?.value || '').trim(), label: String(s?.label || '').trim() }))
      .filter(s => s.value && s.label),
  ]
  const aboutBadge = String(profile?.about_section_badge || 'Tools & Architecture').trim() || 'Tools & Architecture'
  const aboutHeadingPrefix = String(profile?.about_heading_prefix || 'Platform tooling and systems').trim() || 'Platform tooling and systems'
  const aboutHeadingHighlight = String(profile?.about_heading_highlight || 'engineered to scale.').trim() || 'engineered to scale.'
  const aboutIntro = String(profile?.about_section_intro || '').trim()

  const statGridClass =
    statCards.length === 1 ? 'grid-cols-1' :
    statCards.length === 2 ? 'grid-cols-2' :
    statCards.length === 3 ? 'grid-cols-3' :
    'grid-cols-2 sm:grid-cols-4'

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

            {/* Interactive stats */}
            {statCards.length > 0 && (
              <div className={`grid gap-4 ${statGridClass}`}>
                {statCards.map((stat, i) => (
                  <StatCard key={i} value={stat.value} label={stat.label} index={i} />
                ))}
              </div>
            )}

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

