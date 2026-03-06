import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { getActivities } from '../api'

const EXCLUDED_TYPES = new Set(['project', 'achievement'])

const TYPE_BADGE = {
  learning:      'border-blue-500/30 text-blue-400 bg-blue-500/10',
  debugging:     'border-orange-500/30 text-orange-400 bg-orange-500/10',
  contribution:  'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  research:      'border-purple-500/30 text-purple-400 bg-purple-500/10',
  certification: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
  talk:          'border-red-500/30 text-red-400 bg-red-500/10',
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Activities({ limit = 6 }) {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    getActivities({ day_to_day: 1 })
      .then(r => {
        const data = r.data?.results || r.data || []
        setActivities(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }, [])

  const dayToDay = useMemo(() => {
    const filtered = activities.filter(a => !EXCLUDED_TYPES.has(a.activity_type))
    return limit ? filtered.slice(0, limit) : filtered
  }, [activities, limit])

  if (!dayToDay.length) return null

  return (
    <section id="activities" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">Day to Day</span>
          <h2 className="section-title mt-3">Activities</h2>
          <p className="mt-3 text-ink-500 max-w-2xl">
            A live snapshot of what I’m working on—maintenance, debugging, learning, and research.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dayToDay.map((a, i) => {
            const badgeClass = TYPE_BADGE[a.activity_type] || 'border-slate-500/20 text-ink-500 bg-slate-500/5'
            return (
              <motion.div
                key={a.id || `${a.title}-${a.date}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card-hover rounded-2xl p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`badge border ${badgeClass}`}>{a.activity_type_display || a.activity_type}</span>
                  <span className="text-xs text-ink-400">{formatDate(a.date)}</span>
                </div>

                <h3 className="mt-3 font-bold text-ink-900 text-sm leading-snug">{a.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed mt-2 line-clamp-4">{a.description}</p>

                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm text-cobalt-400 hover:text-cobalt-300 transition-colors"
                  >
                    Reference
                  </a>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
