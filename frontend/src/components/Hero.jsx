import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, TrendingUp, Wrench } from 'lucide-react'
import { getFeaturedSkills, getProfile } from '../api'

/* ── Avatar component ───────────────────────────────────────────── */
function Avatar({ profile, name, size = 'md', onClick }) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-40 h-40 sm:w-56 sm:h-56',
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

/* ── Skill helpers ─────────────────────────────────────────────── */
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
  if (/harness/.test(name)) return 'harness'
  if (/api integrations/.test(name)) return 'postman'

  return explicit
}

/* ── Skill chip ─────────────────────────────────────────────── */
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
      transition={{ delay, duration: 0.35 }}
      className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2
                 bg-white/10 backdrop-blur-md border border-white/20 text-white/90"
    >
      {iconUrl && !iconFailed ? (
        <img src={iconUrl} alt={skill.name} className="w-4 h-4" onError={() => setIconFailed(true)} />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-cobalt-300" />
      )}
      <span className="text-xs sm:text-sm font-medium">{skill.name}</span>
    </motion.div>
  )
}

/* ── Hero ─────────────────────────────────────────────── */
export default function Hero() {
  const [profile, setProfile] = useState(null)
  const [featuredSkills, setFeaturedSkills] = useState([])
  const [avatarOpen, setAvatarOpen] = useState(false)

  useEffect(() => {
    Promise.all([getProfile(), getFeaturedSkills()])
      .then(([p, s]) => {
        setProfile(p.data)
        setFeaturedSkills(s.data || [])
      })
  }, [])

  const openingBioLines = String(profile?.bio || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  return (
    <section className="min-h-screen pt-20">

      {/* Bio Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl px-6 py-6
                   shadow-2xl border border-white/20 mb-6
                   transition-all duration-300 hover:bg-white/15"
      >
        {profile?.tagline && (
          <p className="text-xs sm:text-sm font-semibold text-amber-300 mb-4 uppercase tracking-wide">
            {profile.tagline}
          </p>
        )}

        <div className="max-w-3xl space-y-4 text-white/90 leading-relaxed">
          {openingBioLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <a href="#contact" className="btn-primary">Let's Talk</a>
        </div>
      </motion.div>

    </section>
  )
}