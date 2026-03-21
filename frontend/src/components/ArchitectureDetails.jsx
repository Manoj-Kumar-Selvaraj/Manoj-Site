import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, Layers, Wrench, CheckCircle2 } from 'lucide-react'
import { getArchitectureEntries, getProfile } from '../api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: 'easeOut' },
})

export default function ArchitectureDetails() {
  const [entries, setEntries] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    Promise.all([getArchitectureEntries(), getProfile()])
      .then(([entriesRes, profileRes]) => {
        const entryPayload = Array.isArray(entriesRes?.data)
          ? entriesRes.data
          : Array.isArray(entriesRes?.data?.results)
            ? entriesRes.data.results
            : []
        setEntries(entryPayload)
        setProfile(profileRes?.data || null)
      })
      .catch(() => {})
  }, [])

  const applicationsTitle = String(profile?.applications_section_title || 'Applications').trim() || 'Applications'
  const applicationsBody = String(profile?.applications_section_body || '').trim()
  const infraTitle = String(profile?.infra_section_title || 'Infrastructure & Architecture').trim() || 'Infrastructure & Architecture'
  const infraBody = String(profile?.infra_section_body || '').trim()
  const infraDiagram = String(profile?.infra_diagram || '').trim()
  const hasFallbackContent = Boolean(applicationsBody || infraBody || infraDiagram)

  if (!entries.length && !hasFallbackContent) {
    return (
      <section id="architecture" className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-12">
            <span className="section-badge mb-4">Architecture Deep Dives</span>
            <h2 className="section-title mt-3">
              Applications and tools I build with,<br />
              <span className="text-cobalt-600">designed for reliability and scale.</span>
            </h2>
            <p className="mt-3 text-ink-500 max-w-3xl">
              Add architecture entries in Django Admin to publish detailed stack, diagrams, and design notes.
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="architecture" className="py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-12">
          <span className="section-badge mb-4">Architecture Deep Dives</span>
          <h2 className="section-title mt-3">
            Applications and tools I build with,<br />
            <span className="text-cobalt-600">designed for reliability and scale.</span>
          </h2>
          <p className="mt-3 text-ink-500 max-w-3xl">
            Detailed architecture notes for the systems and platforms I work on, including CI/CD foundations,
            cloud runtimes, and operational controls.
          </p>
        </motion.div>

        <div className="space-y-5">
          {applicationsBody && (
            <motion.article
              {...fadeUp(0.04)}
              className="card rounded-2xl p-6 md:p-7"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
                  <Network size={13} /> Application
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink-900 mb-3">{applicationsTitle}</h3>
              <div className="text-ink-600 leading-relaxed whitespace-pre-line">{applicationsBody}</div>
            </motion.article>
          )}

          {(infraBody || infraDiagram) && (
            <motion.article
              {...fadeUp(0.06)}
              className="card rounded-2xl p-6 md:p-7"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Layers size={13} /> Infrastructure
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink-900 mb-3">{infraTitle}</h3>
              {infraBody && <div className="text-ink-600 leading-relaxed whitespace-pre-line">{infraBody}</div>}
              {infraDiagram && (
                <div className="mt-4 border border-ink-100 rounded-xl overflow-hidden bg-white">
                  <img src={infraDiagram} alt="Architecture diagram" className="w-full h-auto object-contain" />
                </div>
              )}
            </motion.article>
          )}

          {entries.map((entry, index) => (
            <motion.article
              key={entry.id || `${entry.title}-${index}`}
              {...fadeUp(0.1 + index * 0.04)}
              className="card rounded-2xl p-6 md:p-7"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
                  <Network size={13} /> Architecture
                </span>
                {entry.context && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Layers size={13} /> {entry.context}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-ink-900 mb-3">{entry.title}</h3>

              {entry.tools_list?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Tooling</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tools_list.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-ink-100 text-ink-700"
                      >
                        <Wrench size={12} /> {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-ink-600 leading-relaxed whitespace-pre-line">{entry.architecture}</div>

              {entry.outcomes_list?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ink-100">
                  <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Key outcomes</p>
                  <ul className="space-y-1.5 text-sm text-ink-700">
                    {entry.outcomes_list.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
