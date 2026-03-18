import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getProfile } from '../api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.6, ease: 'easeOut' },
})

export default function About() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  if (!profile) return null

  const bioParas = String(profile?.bio || '')
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)
  const notesParas = String(profile?.bio_extended || '')
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)
  const dynamicStats = Array.isArray(profile?.stats) ? profile.stats : []
  const focusAreas = Array.isArray(profile?.about_focus_areas) ? profile.about_focus_areas : []
  const careerItems = Array.isArray(profile?.about_career_items) ? profile.about_career_items : []
  const name = String(profile?.name || '').trim()
  const role = String(profile?.about_role || profile?.title || '').trim()
  const shortBio = bioParas.slice(0, 2)
  const detailParas = notesParas.length > 0 ? notesParas : bioParas.slice(2)
  const metrics = [
    ...(profile?.years_experience ? [{ value: `${profile.years_experience}+`, label: String(profile?.years_experience_label || '').trim() || 'Years in Engineering' }] : []),
    ...(profile?.projects_completed ? [{ value: `${profile.projects_completed}+`, label: String(profile?.projects_completed_label || '').trim() || 'Infrastructure Projects' }] : []),
    ...dynamicStats
      .slice()
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .map((stat) => ({ value: String(stat?.value || '').trim(), label: String(stat?.label || '').trim() }))
      .filter((stat) => stat.value && stat.label),
  ]

  return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div {...fadeUp(0)} className="mb-12">
          <span className="section-badge mb-4">{profile?.about_section_badge}</span>
          <h2 className="section-title mt-3 max-w-3xl">
            {profile?.about_heading_prefix} {profile?.about_heading_highlight}
          </h2>
          <p className="mt-3 text-ink-500 max-w-2xl">
            {profile?.about_section_intro}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <motion.div {...fadeUp(0.08)} className="card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={name}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-ink-200 shadow-card flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-cobalt-600 flex items-center justify-center shadow-card flex-shrink-0">
                  <span className="text-4xl font-black text-white">{name[0]}</span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-ink-900">{name}</h3>
                    {role && <p className="text-sm sm:text-base text-ink-500 mt-1">{role}</p>}
                  </div>
                  <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                    Open to work
                  </span>
                </div>

                <div className="mt-6 space-y-4 text-ink-600 leading-relaxed text-sm sm:text-base">
                  {shortBio.map((para) => <p key={para}>{para}</p>)}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.12)} className="card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-black text-ink-900">{profile?.about_career_title}</h3>
              <span className="tag-cobalt">{profile?.about_career_badge}</span>
            </div>
            <ul className="space-y-3">
              {careerItems.map((item) => (
                <li key={`${item.order}-${item.text}`} className="flex items-start gap-3 text-sm text-ink-600 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-cobalt-500 mt-1.5 flex-shrink-0" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.16)} className="mt-6 card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-black text-ink-900">{profile?.about_focus_title}</h3>
              <p className="text-sm text-ink-500 mt-1">{profile?.about_focus_intro}</p>
            </div>
            <span className="tag-amber self-start">{profile?.about_focus_badge}</span>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {focusAreas.map((area, index) => (
              <motion.div
                key={`${area.order}-${area.title}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="rounded-2xl border border-ink-200 bg-white/80 p-5 shadow-sm"
              >
                <h4 className="text-sm font-black text-ink-900 mb-3">{area.title}</h4>
                <ul className="space-y-2">
                  {area.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-ink-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="mt-6 card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-black text-ink-900">{profile?.about_metrics_title}</h3>
              <p className="text-sm text-ink-500 mt-1">{profile?.about_metrics_intro}</p>
            </div>
            <span className="tag">{profile?.about_metrics_badge}</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="card-hover rounded-2xl p-5 text-left"
              >
                <div className="text-2xl sm:text-3xl font-black text-cobalt-700">{metric.value}</div>
                <div className="text-xs sm:text-sm text-ink-500 mt-1 leading-snug">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.24)} className="mt-6 card p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
            <div className="lg:w-56 flex-shrink-0">
              <h3 className="text-xl font-black text-ink-900">{profile?.about_notes_title}</h3>
              <p className="text-sm text-ink-500 mt-2">{profile?.about_notes_intro}</p>
            </div>
            <div className="grid gap-4 flex-1 md:grid-cols-2">
              {detailParas.slice(0, 4).map((para, index) => (
                <div key={`${index}-${para.slice(0, 20)}`} className="rounded-2xl border border-ink-200 bg-white/70 p-5">
                  <p className="text-sm text-ink-600 leading-relaxed">{para}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-ink-100">
            <a href="/#contact" className="btn-primary">{profile?.about_cta_label || "Let's Talk"}</a>
            {profile?.resume && (
              <a href={profile.resume} download className="btn-outline">Download CV</a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
