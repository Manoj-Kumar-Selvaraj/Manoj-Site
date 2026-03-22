import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Network,
  Layers,
  Wrench,
  CheckCircle2,
  Flag,
  Gauge,
  PlugZap,
  Rocket,
  Blocks,
} from 'lucide-react'
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

  const toList = (value) => {
    const text = String(value || '').trim()
    if (!text) return []
    return text
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const buildFallbackDiagram = (tools) => {
    if (!tools.length) {
      return 'User -> React Frontend -> API (Django) -> Cloud Runtime -> Data Store'
    }

    const [first, second, third, fourth] = tools
    const runtime = third || 'Cloud Runtime'
    const data = fourth || 'Data Store'
    return `User -> React Frontend -> API (Django) -> ${runtime} -> ${data}${first ? ` (${first}${second ? `, ${second}` : ''})` : ''}`
  }

  const sectionCards = [
    ...(applicationsBody
      ? [{
        id: 'applications-profile',
        title: applicationsTitle,
        purpose: applicationsBody,
        techStack: [],
        architectureOverview: infraBody || applicationsBody,
        diagramImage: infraDiagram,
        diagramText: '',
        keyFeatures: toList(profile?.bio_extended),
        challenges: [],
        optimizations: [],
        integrations: [],
        deployment: [],
      }]
      : []),
    ...entries.map((entry) => ({
      id: entry.id,
      title: String(entry?.title || '').trim() || 'Application / Tool',
      purpose: String(entry?.context || '').trim(),
      techStack: Array.isArray(entry?.tools_list) ? entry.tools_list : [],
      architectureOverview: String(entry?.architecture || '').trim(),
      diagramImage: String(entry?.diagram_image || '').trim(),
      diagramImageUrl: String(entry?.diagram_image_url || '').trim(),
      diagramText: String(entry?.diagram_text || '').trim(),
      keyFeatures: Array.isArray(entry?.outcomes_list) ? entry.outcomes_list : [],
      challenges: toList(entry?.challenges_solutions),
      optimizations: toList(entry?.performance_optimizations),
      integrations: toList(entry?.integration_points),
      deployment: toList(entry?.deployment_strategy),
    })),
    ...(!applicationsBody && (infraBody || infraDiagram)
      ? [{
        id: 'infra-profile',
        title: infraTitle,
        purpose: infraBody,
        techStack: [],
        architectureOverview: infraBody,
        diagramImage: infraDiagram,
        diagramText: '',
        keyFeatures: [],
        challenges: [],
        optimizations: [],
        integrations: [],
        deployment: [],
      }]
      : []),
  ]

  if (!entries.length && !hasFallbackContent) {
    return (
      <section id="architecture" className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-12">
            <span className="section-badge mb-4">Architecture Deep Dives</span>
            <h2 className="section-title mt-3">
                Applications &amp; Tools<br />
                <span className="text-cobalt-600">technical implementation and architecture.</span>
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
          <span className="section-badge mb-4">Applications &amp; Tools</span>
          <h2 className="section-title mt-3">
            Application systems and engineering tools,<br />
            <span className="text-cobalt-600">from stack details to architecture decisions.</span>
          </h2>
          <p className="mt-3 text-ink-500 max-w-3xl">
            Deep technical snapshots of the platforms and applications I build, including tech stacks,
            architecture flow, deployment patterns, and operational trade-offs.
          </p>
        </motion.div>

        <div className="space-y-5">
          {sectionCards.map((entry, index) => {
            const diagramText = entry.diagramText || buildFallbackDiagram(entry.techStack)
            const diagramImage = String(entry.diagramImageUrl || entry.diagramImage || '').trim()
            const hasDetails = entry.keyFeatures.length || entry.challenges.length || entry.optimizations.length || entry.integrations.length || entry.deployment.length

            return (
            <motion.article
              key={entry.id || `${entry.title}-${index}`}
              {...fadeUp(0.1 + index * 0.04)}
              className="card rounded-2xl p-6 md:p-7"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
                  <Network size={13} /> Application / Tool
                </span>
                {entry.purpose && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Layers size={13} /> Context
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-ink-900 mb-3">{entry.title}</h3>

              {entry.purpose && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Description / Purpose</p>
                  <p className="text-ink-600 leading-relaxed whitespace-pre-line">{entry.purpose}</p>
                </div>
              )}

              {entry.techStack?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.techStack.map((tool) => (
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

              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Architecture Overview</p>
                <div className="text-ink-600 leading-relaxed whitespace-pre-line">{entry.architectureOverview || 'Architecture notes can be managed from admin.'}</div>
              </div>

              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Architecture Diagram</p>
                {diagramImage ? (
                  <div className="border border-ink-100 rounded-xl overflow-hidden bg-white">
                    <img src={diagramImage} alt="Architecture diagram" className="w-full h-auto object-contain" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-700 font-mono whitespace-pre-wrap">
                    {diagramText}
                  </div>
                )}
              </div>

              {entry.keyFeatures.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ink-100">
                  <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2">Key Features</p>
                  <ul className="space-y-1.5 text-sm text-ink-700">
                    {entry.keyFeatures.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasDetails && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {entry.challenges.length > 0 && (
                    <div className="rounded-xl border border-ink-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2 inline-flex items-center gap-1.5"><Flag size={12} /> Challenges &amp; Solutions</p>
                      <ul className="space-y-1.5 text-sm text-ink-700">
                        {entry.challenges.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {entry.optimizations.length > 0 && (
                    <div className="rounded-xl border border-ink-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2 inline-flex items-center gap-1.5"><Gauge size={12} /> Performance Optimizations</p>
                      <ul className="space-y-1.5 text-sm text-ink-700">
                        {entry.optimizations.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {entry.integrations.length > 0 && (
                    <div className="rounded-xl border border-ink-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2 inline-flex items-center gap-1.5"><PlugZap size={12} /> Integration Points</p>
                      <ul className="space-y-1.5 text-sm text-ink-700">
                        {entry.integrations.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {entry.deployment.length > 0 && (
                    <div className="rounded-xl border border-ink-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2 inline-flex items-center gap-1.5"><Rocket size={12} /> Deployment Strategy</p>
                      <ul className="space-y-1.5 text-sm text-ink-700">
                        {entry.deployment.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!hasDetails && (
                <div className="mt-4 rounded-xl border border-ink-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold mb-2 inline-flex items-center gap-1.5"><Blocks size={12} /> Additional Engineering Notes</p>
                  <p className="text-sm text-ink-600">
                    Add challenge/optimization/integration/deployment notes in admin to enrich this architecture card.
                  </p>
                </div>
              )}
            </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
