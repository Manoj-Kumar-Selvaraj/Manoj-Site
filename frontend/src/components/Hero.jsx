import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, TrendingUp, Wrench } from 'lucide-react'
import { getFeaturedSkills, getProfile } from '../api'

/* ── Avatar component ───────────────────────────────────────────── */
function Avatar({ profile, name, size = 'md', onClick }) {
  const sizeMap = {
    sm:  'w-16 h-16',
    md:  'w-20 h-20 sm:w-24 sm:h-24',
    lg:  'w-40 h-40 sm:w-56 sm:h-56',
  }
  return (
    <div
      className={`${sizeMap[size]} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center
                  border-2 border-white/60 shadow-xl bg-cobalt-700/80 backdrop-blur-sm
                  ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}`}
      onClick={onClick}
      title={onClick ? 'Click to enlarge' : undefined}
    >
      {profile?.avatar ? (
        <img src={profile.avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-white/70 px-2 text-center">
          <Camera size={size === 'lg' ? 36 : 20} />
          {size !== 'lg' && <span className="text-[10px] leading-tight">Add photo</span>}
        </div>
      )}
    </div>
  )
}

/* ── Stat card component ────────────────────────────────────────── */
function StatCard({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl
                 bg-white/10 backdrop-blur-md border border-white/20
                 px-4 py-3 text-center shadow-lg
                 hover:bg-white/15 hover:border-white/30 transition-all duration-300
                 hover:-translate-y-0.5"
    >
      <div className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-sm">{value}</div>
      <div className="text-[11px] sm:text-xs text-white/70 mt-0.5 leading-tight">{label}</div>
    </motion.div>
  )
}

function isDirectIconSource(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/') || value.startsWith('data:')
}

function resolveIconSource(skill) {
  const uploaded = String(skill?.icon_upload_url || skill?.icon_upload || '').trim()
  if (uploaded) return uploaded

  const explicit = String(skill?.icon || '').trim()
  if (explicit && isDirectIconSource(explicit)) return explicit

  const name = String(skill?.name || '').toLowerCase()
  if (/aws|cloudwatch|eventbridge|route\s*53|eks|s3|vpc|iam|kms/.test(name)) return 'amazonaws'
  if (/kubernetes/.test(name)) return 'kubernetes'
  if (/docker/.test(name)) return 'docker'
  if (/helm/.test(name)) return 'helm'
  if (/github actions|arc runner/.test(name)) return 'githubactions'
  if (/jenkins|cloudbees/.test(name)) return 'jenkins'
  if (/sonarqube/.test(name)) return 'sonarqube'
  if (/jfrog|artifactory/.test(name)) return 'jfrog'
  if (/python/.test(name)) return 'python'
  if (/bash/.test(name)) return 'gnubash'
  if (/terraform/.test(name)) return 'terraform'
  if (/cloudformation/.test(name)) return 'amazonaws'
  if (/harness/.test(name)) return 'harness'
  if (/api integrations/.test(name)) return 'postman'

  return explicit
}

function SkillChip({ skill, delay = 0 }) {
  const [iconFailed, setIconFailed] = useState(false)
  const source = resolveIconSource(skill)
  const iconUrl = source && !isDirectIconSource(source)
    ? `https://cdn.simpleicons.org/${source}`
    : source

  useEffect(() => {
    setIconFailed(false)
  }, [iconUrl])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2
                 bg-white/10 backdrop-blur-md border border-white/20 text-white/90"
    >
      {iconUrl && !iconFailed ? (
        <img
          src={iconUrl}
          alt={skill.name}
          className="w-4 h-4 object-contain"
          onError={() => setIconFailed(true)}
        />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-cobalt-300" />
      )}
      <span className="text-xs sm:text-sm font-medium leading-none">{skill.name}</span>
    </motion.div>
  )
}

/* ── Hero component ─────────────────────────────────────────────── */
export default function Hero() {
  const [profile, setProfile] = useState(null)
  const [featuredSkills, setFeaturedSkills] = useState([])
  const [avatarOpen, setAvatarOpen] = useState(false)

  useEffect(() => {
    Promise.all([getProfile(), getFeaturedSkills()])
      .then(([profileRes, skillsRes]) => {
        setProfile(profileRes.data)
        setFeaturedSkills(Array.isArray(skillsRes.data) ? skillsRes.data : [])
      })
      .catch(() => {
        getProfile().then(r => setProfile(r.data)).catch(() => {})
      })
  }, [])

  const name    = profile?.name    || ''
  const title   = profile?.title   || ''
  const tagline = profile?.tagline || ''
  const heroToolsLabel = String(profile?.hero_tools_label || 'Core tools & services').trim() || 'Core tools & services'
  const heroStatsLabel = String(profile?.hero_stats_label || 'Quick stats').trim() || 'Quick stats'

  const intro = String(profile?.bio || '')
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(Boolean)
  const heroIntro = intro[0] || ''
  const shortIntro = heroIntro.length > 340 ? `${heroIntro.slice(0, 337).trimEnd()}...` : heroIntro

  /* Build stat cards from fixed fields + dynamic ProfileStat entries */
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

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-start sm:items-center overflow-hidden hero-section pt-20 pb-10 sm:pb-0"
    >

      {/* Decorative background accent blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cobalt-600/20 blur-3xl animate-float-1" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl animate-float-2" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-cobalt-400/10 blur-3xl animate-float-3" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">

        {/* Identity row: avatar + name / title / availability */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <Avatar
            profile={profile}
            name={name}
            size="md"
            onClick={profile?.avatar ? () => setAvatarOpen(true) : undefined}
          />
          <div>
            {name && (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white hero-text-glow leading-tight">
                {name}
              </h1>
            )}
            <div className="text-sm sm:text-base font-semibold text-white/80 mt-0.5 leading-snug">
              {title || 'Portfolio'}
            </div>
            {profile?.is_available && (
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-300 bg-emerald-900/40 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                Open to work
              </span>
            )}
          </div>
        </motion.div>

        {/* Tagline + bio glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl px-6 py-5
                     shadow-xl border border-white/20 mb-6"
        >
          {tagline && (
            <p className="text-xs sm:text-sm font-semibold text-amber-300/90 mb-3 tracking-wide">
              {tagline}
            </p>
          )}
          {shortIntro && (
            <div className="space-y-3 text-sm sm:text-base text-white/85 leading-relaxed">
              <p>{shortIntro}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-5">
            <a href="/#contact" className="btn-primary">Let's Talk</a>
            {profile?.resume && (
              <a href={profile.resume} download className="btn-outline">Download CV</a>
            )}
          </div>
        </motion.div>

        {/* Curated tools and services */}
        {featuredSkills.length > 0 && (
          <div id="hero-toolkit" className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={14} className="text-white/50" />
              <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">{heroToolsLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {featuredSkills.slice(0, 8).map((skill, i) => (
                <SkillChip key={skill.id || `${skill.name}-${i}`} skill={skill} delay={0.35 + i * 0.05} />
              ))}
            </div>
          </div>
        )}

        {/* Stat cards */}
        {statCards.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-white/50" />
            <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">{heroStatsLabel}</span>
          </div>
        )}
        {statCards.length > 0 && (() => {
          const cols = statCards.length <= 2 ? 'grid-cols-2'
            : statCards.length === 3 ? 'grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
          return (
            <div className={`grid gap-3 ${cols}`}>
              {statCards.map((s, i) => (
                <StatCard key={s.label} value={s.value} label={s.label} delay={0.4 + i * 0.1} />
              ))}
            </div>
          )
        })()}

      </div>

      {/* Avatar lightbox / expand overlay */}
      <AnimatePresence>
        {avatarOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAvatarOpen(false)}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={e => e.stopPropagation()}
            >
              <Avatar profile={profile} name={name} size="lg" />
              <button
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30
                           flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                onClick={() => setAvatarOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}

