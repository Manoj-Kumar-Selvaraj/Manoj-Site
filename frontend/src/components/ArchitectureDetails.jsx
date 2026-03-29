import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X, ChevronDown } from 'lucide-react'
import { getArchitectureEntries, getToolArchitectures } from '../api'
import ToolArchitectureCard from './ToolArchitectureCard'
import { SectionHeaderSkeleton, CardSkeleton } from './ui/Skeleton'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: 'easeOut' },
})

/* ── Render multi-paragraph text as <p> blocks ───────────────────── */
function Paragraphs({ text, className = '' }) {
  const paras = String(text || '')
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
  if (!paras.length) return null
  return (
    <div className={`space-y-3 ${className}`}>
      {paras.map((p, i) => (
        <p key={i} className="text-sm sm:text-base text-ink-600 leading-relaxed whitespace-pre-line">{p}</p>
      ))}
    </div>
  )
}

function DiagramImage({ src, alt, className = '', onClick, showExpand = false }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    if (!src) return

    const image = new Image()
    image.src = src

    if (image.complete) {
      setLoaded(true)
      return
    }

    image.onload = () => setLoaded(true)
    return () => {
      image.onload = null
    }
  }, [src])

  return (
    <div className={`relative rounded-xl border border-ink-200 bg-white overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-ink-100/80" />
      )}
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {showExpand && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                     bg-white/95 text-ink-700 border border-ink-200 shadow-sm text-xs font-semibold
                     hover:bg-white"
        >
          <Maximize2 size={12} /> Expand
        </button>
      )}
    </div>
  )
}

/* ── Single Architecture Entry card ──────────────────────────────── */
function ArchitectureEntryCard({ entry, index, onDiagramPreview }) {
  const diagramUrl = String(entry.diagram_image_url || entry.diagram_image || '').trim()
  const hasText = String(entry.purpose || '').trim() || String(entry.architecture || '').trim()

  return (
    <motion.article
      {...fadeUp(0.06 + index * 0.04)}
      className="card-hover rounded-2xl overflow-hidden"
    >
      <div className="p-5 sm:p-7 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7 space-y-4">
          {/* Title + context badge */}
          <div>
            <h3 className="text-lg font-black text-ink-900">{entry.title}</h3>
            {entry.context && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
                {entry.context}
              </span>
            )}
          </div>

          {/* Purpose */}
          <Paragraphs text={entry.purpose} />

          {/* Architecture detail */}
          <Paragraphs text={entry.architecture} />

          {/* Tools list */}
          {entry.tools_list?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tools_list.map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}

          {/* Engineering details — collapsible */}
          <EngineeringDetails entry={entry} />
        </div>

        <div className="lg:col-span-5 mt-4 lg:mt-0">
          {diagramUrl ? (
            <>
              <DiagramImage
                src={diagramUrl}
                alt={`${entry.title} architecture diagram`}
                showExpand
                onClick={() => onDiagramPreview({
                  src: diagramUrl,
                  title: entry.title,
                  caption: entry.diagram_text || '',
                })}
              />
              {entry.diagram_text && (
                <p className="px-2 pt-2 text-xs text-ink-500 italic">{entry.diagram_text}</p>
              )}
            </>
          ) : !hasText ? (
            <div className="h-40 rounded-xl border border-dashed border-ink-300 flex items-center justify-center text-ink-400 text-sm">
              Add an architecture diagram or description in admin
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

/* ── Collapsible engineering add-ons ─────────────────────────────── */
function EngineeringDetails({ entry }) {
  const sections = [
    { label: 'Key Outcomes', text: entry.key_outcomes },
    { label: 'Challenges & Solutions', text: entry.challenges_solutions },
    { label: 'Performance Optimizations', text: entry.performance_optimizations },
    { label: 'Integration Points', text: entry.integration_points },
    { label: 'Deployment Strategy', text: entry.deployment_strategy },
  ].filter(s => String(s.text || '').trim())

  const [open, setOpen] = useState(false)

  const toPointers = (text) => {
    const raw = String(text || '').trim()
    if (!raw) return []
    return raw
      .split(/\r?\n+/)
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
  }

  if (!sections.length) return null

  return (
    <div className="border-t border-ink-100 pt-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-cobalt-700 hover:text-cobalt-600"
      >
        Engineering Details
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4 rounded-xl bg-ink-50/70 border border-ink-100 p-4 mt-2">
              {sections.map(s => (
                <div key={s.label}>
                  <p className="text-xs tracking-wide text-ink-500 font-bold mb-2">{s.label}</p>
                  {toPointers(s.text).length > 1 ? (
                    <ul className="space-y-1.5 text-sm sm:text-base text-ink-700 leading-relaxed">
                      {toPointers(s.text).map((point, idx) => (
                        <li key={`${s.label}-${idx}`} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cobalt-500 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Paragraphs text={s.text} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main section ────────────────────────────────────────────────── */
export default function ArchitectureDetails() {
  const defaultVisibleCards = 3
  const [tools, setTools] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllCards, setShowAllCards] = useState(false)
  const [diagramPreview, setDiagramPreview] = useState(null)

  useEffect(() => {
    Promise.all([getToolArchitectures(), getArchitectureEntries()])
      .then(([toolRes, archRes]) => {
        setTools(Array.isArray(toolRes?.data) ? toolRes.data : toolRes?.data?.results || [])
        setEntries(Array.isArray(archRes?.data) ? archRes.data : archRes?.data?.results || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="architecture" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeaderSkeleton />
          <div className="space-y-5">
            {[1, 2, 3].map(i => <CardSkeleton key={i} lines={4} />)}
          </div>
        </div>
      </section>
    )
  }

  if (!entries.length && !tools.length) return null

  const toolCards = tools.length > 0 ? tools : []
  const visibleCards = showAllCards ? toolCards : toolCards.slice(0, defaultVisibleCards)
  const hiddenCardCount = Math.max(toolCards.length - defaultVisibleCards, 0)

  return (
    <section id="architecture" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-10">
          <span className="section-badge mb-3">Architecture</span>
          <h2 className="section-title mt-2">Platform Architecture &amp; Tooling</h2>
        </motion.div>

        {/* ── Architecture entries (unified cards with text + diagrams) ── */}
        {entries.length > 0 && (
          <div className="space-y-5 mb-6">
            {entries.map((entry, i) => (
              <ArchitectureEntryCard
                key={entry.id}
                entry={entry}
                index={i}
                onDiagramPreview={setDiagramPreview}
              />
            ))}
          </div>
        )}

        {/* ── Tool architecture cards ──────────────────────────────────── */}
        {toolCards.length > 0 && (
          <>
            {entries.length > 0 && (
              <motion.div {...fadeUp(0.04)} className="mt-8 mb-5">
                <h3 className="text-base font-bold text-ink-800">Tooling Breakdown</h3>
              </motion.div>
            )}
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
            </div>

            {hiddenCardCount > 0 && !showAllCards && (
              <div className="mt-5">
                <button type="button" onClick={() => setShowAllCards(true)} className="btn-outline">
                  Show {hiddenCardCount} more tools
                </button>
              </div>
            )}
            {showAllCards && toolCards.length > defaultVisibleCards && (
              <div className="mt-5">
                <button type="button" onClick={() => setShowAllCards(false)} className="btn-outline">
                  Show less
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Diagram lightbox ───────────────────────────────────────── */}
      <AnimatePresence>
        {diagramPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink-900/88 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={() => setDiagramPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-6xl rounded-2xl overflow-hidden bg-white shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setDiagramPreview(null)}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-xl bg-white/92 text-ink-700 border border-ink-200 flex items-center justify-center hover:bg-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <div className="px-5 sm:px-6 py-3.5 border-b border-ink-200 bg-white">
                <h3 className="text-base sm:text-lg font-bold text-ink-900 pr-14">{diagramPreview.title} — Architecture</h3>
                {diagramPreview.caption && <p className="text-sm text-ink-500 mt-1 pr-14">{diagramPreview.caption}</p>}
              </div>
              <div className="bg-ink-100/70 p-2 sm:p-3 md:p-4 flex items-center justify-center">
                <img
                  src={diagramPreview.src}
                  alt={`${diagramPreview.title} architecture diagram`}
                  className="w-full max-h-[82vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
