import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getActivities } from '../api'

const EXCLUDED_TYPES = new Set(['project', 'achievement'])

const TYPE_META = {
  learning: { emoji: '📚', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  debugging: { emoji: '🔧', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  contribution: { emoji: '🤝', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  research: { emoji: '🔬', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  certification: { emoji: '🎓', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  talk: { emoji: '🎤', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
}

const DEFAULT_META = { emoji: '📌', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }

const ALL_TYPES = [
  ['learning', 'Learning'],
  ['debugging', 'Debugging'],
  ['contribution', 'Contributions'],
  ['research', 'Research'],
  ['certification', 'Certifications'],
  ['talk', 'Talks'],
]

export default function ActivitiesView() {
  const [activities, setActivities] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getActivities({ day_to_day: 1 })
      .then(r => {
        const data = r.data.results || r.data
        const list = Array.isArray(data) ? data : []
        setActivities(list.filter(a => !EXCLUDED_TYPES.has(a.activity_type)))
      })
      .catch(() => {})
  }, [])

  const filtered = filter ? activities.filter(a => a.activity_type === filter) : activities

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="badge mb-4">Logbook</span>
          <h1 className="text-4xl font-black gradient-text mb-4">Activities</h1>
          <p className="text-slate-500">Ongoing learning, debugging wins, contributions, and research.</p>
        </motion.div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setFilter('')}
            className={`badge cursor-pointer transition-all ${!filter ? 'border-cyan-500/50 text-cyan-400' : ''}`}
          >
            All ({activities.length})
          </button>
          {ALL_TYPES.map(([type, label]) => {
            const count = activities.filter(a => a.activity_type === type).length
            if (count === 0) return null
            const meta = TYPE_META[type]
            return (
              <button
                key={type}
                onClick={() => setFilter(f => f === type ? '' : type)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${meta.color} ${filter === type ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
              >
                <span>{meta.emoji}</span>
                {label} ({count})
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 py-24">
            <p className="text-6xl mb-4">📋</p>
            <p className="text-lg">No activities yet — more coming soon!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-purple-500/20 to-transparent hidden sm:block" />

            <div className="space-y-6">
              {filtered.map((act, i) => {
                const meta = TYPE_META[act.activity_type] || DEFAULT_META
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="sm:pl-16 relative"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-3 top-5 w-6 h-6 rounded-full border flex items-center justify-center text-xs hidden sm:flex ${meta.color}`}>
                      {meta.emoji}
                    </div>

                    <div className="glass-hover rounded-2xl p-5 gradient-border">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="sm:hidden text-lg">{meta.emoji}</span>
                          <h3 className="text-white font-semibold">{act.title}</h3>
                        </div>
                        <div className="text-slate-600 text-xs whitespace-nowrap">
                          {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-3">{act.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${meta.color}`}>
                          {act.activity_type_display || act.activity_type}
                        </span>
                        {(act.tags || []).map(tag => (
                          <span key={tag} className="tag text-xs">{tag}</span>
                        ))}
                        {act.link && (
                          <a href={act.link} target="_blank" rel="noreferrer"
                             className="ml-auto text-cyan-500 hover:text-cyan-400 text-xs transition-colors">
                            View →
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
