import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Github, ExternalLink, Calendar, Wrench } from 'lucide-react'
import { getOpenSourceContributions, getProfile } from '../api'

const PLACEHOLDERS = [
  {
    id: 'ph-1',
    title: 'Contribution placeholder',
    repository: 'owner/repo',
    summary: 'Add your first open source contribution from admin to showcase fixes, features, or docs improvements.',
    contribution_type: 'Feature',
  },
  {
    id: 'ph-2',
    title: 'Bugfix contribution placeholder',
    repository: 'owner/repo',
    summary: 'Use this section to highlight debugging work, production fixes, and PRs merged upstream.',
    contribution_type: 'Bug Fix',
  },
]

export default function OpenSourceContributions() {
  const [items, setItems] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    Promise.all([getOpenSourceContributions(), getProfile()])
      .then(([contribRes, profileRes]) => {
        const data = contribRes.data.results || contribRes.data
        setItems(Array.isArray(data) ? data : [])
        setProfile(profileRes.data)
      })
      .catch(() => setItems([]))
  }, [])

  const sectionBadge = String(profile?.open_source_section_badge || 'Open Source').trim() || 'Open Source'
  const sectionTitle = String(profile?.open_source_section_title || 'Open Source Contributions').trim() || 'Open Source Contributions'
  const sectionIntro = String(profile?.open_source_section_intro || 'Projects, fixes, and tooling contributions shared with the community.').trim()

  const cards = items.length > 0 ? items : PLACEHOLDERS

  return (
    <section id="open-source" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">{sectionBadge}</span>
          <h2 className="section-title mt-3">{sectionTitle}</h2>
          {sectionIntro && <p className="mt-3 text-ink-500 max-w-2xl">{sectionIntro}</p>}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((item, i) => {
            const dateText = item?.contribution_date
              ? new Date(item.contribution_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : ''

            return (
              <motion.article
                key={item.id || `placeholder-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-hover rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-ink-900 leading-snug">{item.title}</h3>
                    <p className="text-sm text-ink-500 mt-1 flex items-center gap-2">
                      <Github size={14} />
                      {item.repository || 'Repository TBD'}
                    </p>
                  </div>
                  {item.contribution_type ? (
                    <span className="tag-cobalt whitespace-nowrap">{item.contribution_type}</span>
                  ) : (
                    <span className="tag whitespace-nowrap">Contribution</span>
                  )}
                </div>

                <p className="text-sm text-ink-600 leading-relaxed">{item.summary || 'Contribution details coming soon.'}</p>

                <div className="mt-4 flex items-center gap-3 text-xs text-ink-500">
                  {dateText ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} />
                      {dateText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Wrench size={12} />
                      Placeholder
                    </span>
                  )}

                  {item.contribution_url && (
                    <a
                      href={item.contribution_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1.5 text-cobalt-700 hover:text-cobalt-600 font-medium"
                    >
                      View PR
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
