import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getProfile, getSkillsGrouped } from '../api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.6, ease: 'easeOut' },
})

export default function About() {
  const [profile, setProfile] = useState(null)
  const [skillGroups, setSkillGroups] = useState([])

  useEffect(() => {
    let active = true

    Promise.allSettled([getProfile(), getSkillsGrouped()]).then(([profileResult, skillsResult]) => {
      if (!active) return

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value.data)
      }

      if (skillsResult.status === 'fulfilled') {
        const data = Array.isArray(skillsResult.value.data) ? skillsResult.value.data : []
        setSkillGroups(data.filter(group => Array.isArray(group?.skills) && group.skills.length > 0))
      }
    })

    return () => {
      active = false
    }
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
  const toolGroups = skillGroups.slice(0, 6)

  return (
    <section id="about" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div {...fadeUp(0)} className="mb-16">
          <span className="section-badge mb-4">About Me</span>
          <h2 className="section-title mt-3">
            Building infrastructure that<br />
            <span className="text-cobalt-600">teams actually rely on.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-8 items-start">

          {/* Bio */}
          <motion.div {...fadeUp(0.1)} className="space-y-6">

            {/* Avatar / initial */}
            <div className="flex items-center gap-5">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-ink-200 shadow-card"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-cobalt-600 flex items-center justify-center shadow-card flex-shrink-0">
                  <span className="text-3xl font-black text-white">
                    {(profile?.name || 'P')[0]}
                  </span>
                </div>
              )}
              <div>
                <div className="font-black text-2xl text-ink-900">{profile?.name}</div>
                {profile?.title && (
                  <div className="text-ink-500 text-sm mt-0.5">{profile.title}</div>
                )}
                {profile?.is_available && (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                    Open to work
                  </span>
                )}
              </div>
            </div>

            {/* Bio text */}
            <div className="space-y-4 text-ink-600 leading-relaxed text-base">
              {bioParas.map((para, i) => <p key={i}>{para}</p>)}
            </div>

            {/* Quick facts */}
            {statCards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {statCards.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="card p-4 text-center">
                    <div className="text-xl font-black text-amber-600">{s.value}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{s.label}</div>
                  </div>
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

          <motion.aside {...fadeUp(0.16)} className="card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <span className="section-badge">Tools & Applications</span>
                <h3 className="text-xl font-black text-ink-900 mt-3">
                  What I work with day to day
                </h3>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                  A practical snapshot of the platforms, tooling, and engineering systems I operate most often.
                </p>
              </div>
            </div>

            {toolGroups.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {toolGroups.map((group, index) => {
                  const skills = Array.isArray(group.skills) ? group.skills : []
                  const visibleSkills = skills.slice(0, 6)
                  const remainingCount = Math.max(skills.length - visibleSkills.length, 0)

                  return (
                    <motion.div
                      key={group.category || group.label || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * index, duration: 0.35 }}
                      className="rounded-2xl border border-ink-200 bg-white/80 p-4 shadow-sm"
                    >
                      <h4 className="text-sm font-black text-ink-900 mb-3">
                        {group.label || group.category}
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {visibleSkills.map((skill) => (
                          <span key={skill.id || skill.name} className="tag">
                            {skill.name}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span className="tag-cobalt">+{remainingCount} more</span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-ink-200 bg-white/70 p-5 text-sm text-ink-500 leading-relaxed">
                Add skills in the admin panel to populate this tools overview.
              </div>
            )}
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
