import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getExperiences } from '../api'

function ExpCard({ exp, index }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card rounded-2xl overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-6 flex items-start justify-between gap-4 group"
      >
        <div className="flex items-start gap-4 flex-1">
          {/* Company initial badge */}
          <div className="w-12 h-12 rounded-xl bg-cobalt-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-black text-lg">{(exp.role || 'E')[0]}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-ink-900 text-lg leading-tight">{exp.role}</h3>
          </div>
        </div>

        <div className="text-ink-400 group-hover:text-cobalt-600 transition-colors mt-1 flex-shrink-0">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-6 pb-6 border-t border-ink-100">
          <p className="text-ink-600 text-sm leading-relaxed mt-4 mb-4">{exp.description}</p>

          {exp.highlights?.length > 0 && (
            <ul className="space-y-2 mb-5">
              {exp.highlights.map((h, hi) => (
                String(h || '').startsWith('SECTION:') ? (
                  <li
                    key={hi}
                    className="pt-3 text-xs font-black uppercase tracking-wide text-ink-900"
                  >
                    {String(h).replace(/^SECTION:\s*/, '')}
                  </li>
                ) : (
                  <li key={hi} className="flex gap-3 text-sm text-ink-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 mt-1.5 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                )
              ))}
            </ul>
          )}

          {exp.tech_stack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {exp.tech_stack.map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function Experience() {
  const [experiences, setExperiences] = useState([])

  useEffect(() => {
    getExperiences()
      .then(r => {
        const data = r.data.results || r.data
        setExperiences(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
  }, [])

  if (!experiences.length) return null

  return (
    <section id="experience" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">Work History</span>
          <h2 className="section-title mt-3">Experience</h2>
          <p className="mt-3 text-ink-500">
            Platform engineering and large-scale migrations.
          </p>
        </motion.div>

        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <ExpCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
