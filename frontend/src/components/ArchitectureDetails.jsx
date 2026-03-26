import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getArchitectureEntries, getToolArchitectures } from '../api'
import ToolArchitectureCard from './ToolArchitectureCard'
import { SectionHeaderSkeleton, CardSkeleton } from './ui/Skeleton'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: 'easeOut' },
})

export default function ArchitectureDetails() {
  const defaultVisibleCards = 3
  const [tools, setTools] = useState([])
  const [legacyEntries, setLegacyEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllCards, setShowAllCards] = useState(false)

  useEffect(() => {
    Promise.all([getToolArchitectures(), getArchitectureEntries()])
      .then(([toolRes, archRes]) => {
        const toolPayload = Array.isArray(toolRes?.data)
          ? toolRes.data
          : Array.isArray(toolRes?.data?.results)
            ? toolRes.data.results
            : []

        const legacyPayload = Array.isArray(archRes?.data)
          ? archRes.data
          : Array.isArray(archRes?.data?.results)
            ? archRes.data.results
            : []

        setTools(toolPayload)
        setLegacyEntries(legacyPayload)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const systemDiagramUrl = String(
    legacyEntries.find((entry) => String(entry?.diagram_image_url || entry?.diagram_image || '').trim())?.diagram_image_url
      || legacyEntries.find((entry) => String(entry?.diagram_image_url || entry?.diagram_image || '').trim())?.diagram_image
      || ''
  ).trim()

  const fallbackCards = tools.length === 0
    ? legacyEntries.map((entry) => ({
      id: entry.id,
      name: entry.title,
      role: [entry.purpose, entry.context].filter(Boolean).join('\n'),
      setup: (Array.isArray(entry.tools_list) ? entry.tools_list.join('\n') : entry.tools) || '',
      usage: entry.architecture || '',
      communication: entry.integration_points || entry.diagram_text || '',
      tradeoffs: [entry.challenges_solutions, entry.performance_optimizations, entry.deployment_strategy]
        .filter(Boolean)
        .join('\n'),
    }))
    : []

  const cardsToRender = tools.length > 0 ? tools : fallbackCards
  const visibleCards = showAllCards ? cardsToRender : cardsToRender.slice(0, defaultVisibleCards)
  const hiddenCardCount = Math.max(cardsToRender.length - defaultVisibleCards, 0)

  if (loading) {
    return (
      <section id="architecture" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeaderSkeleton />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} lines={4} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="architecture" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-8 max-w-3xl">
          <span className="section-badge mb-3">Architecture</span>
          <h2 className="section-title mt-2">Platform Architecture &amp; Tooling in Practice</h2>
        </motion.div>

        <motion.div
          {...fadeUp(0.04)}
          className="card rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 px-5 py-4 md:px-6 md:py-5 mb-4"
        >
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-base sm:text-lg font-semibold text-ink-900">System Overview</h3>
            <p className="text-sm sm:text-base text-ink-700 leading-relaxed">
              Placeholder overview describing how platform components are structured and how tooling supports
              delivery, observability, and runtime operations.
            </p>
            {systemDiagramUrl ? (
              <div className="rounded-xl border border-ink-200 bg-white p-2">
                <img
                  src={systemDiagramUrl}
                  alt="Architecture diagram"
                  className="w-full max-h-[340px] h-auto object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="h-40 rounded-xl border border-dashed border-ink-300 flex items-center justify-center text-ink-400 text-sm">
                Architecture diagram placeholder
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          {visibleCards.map((tool, index) => (
            <motion.div key={tool.id || `${tool.name}-${index}`} {...fadeUp(0.08 + index * 0.03)}>
              <ToolArchitectureCard
                title={tool.name}
                role={tool.role}
                setup={tool.setup}
                usage={tool.usage}
                communication={tool.communication}
                tradeoffs={tool.tradeoffs}
              />
            </motion.div>
          ))}

          {cardsToRender.length === 0 && (
            <div className="card rounded-2xl shadow-xl px-5 py-4 md:px-6 md:py-5">
              <div className="max-w-3xl space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-ink-900">Architecture entries required</h3>
                <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                  Add Tool Architecture or Architecture Entry records in admin to populate this section.
                </p>
              </div>
            </div>
          )}
        </div>

        {hiddenCardCount > 0 && !showAllCards && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowAllCards(true)}
              className="btn-outline"
            >
              Show {hiddenCardCount} more tools
            </button>
          </div>
        )}

        {showAllCards && cardsToRender.length > defaultVisibleCards && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowAllCards(false)}
              className="btn-outline"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
