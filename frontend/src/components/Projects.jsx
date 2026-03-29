import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Github, ExternalLink, ArrowRight, Maximize2, X } from 'lucide-react'
import { getProfile, getProjects } from '../api'
import { SectionHeaderSkeleton, Skeleton } from './ui/Skeleton'

function normalizeTitle(title) {
  return String(title || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function dedupeProjects(list) {
  const seen = new Set()
  const out = []

  for (const p of (list || [])) {
    const key = p?.slug ? `slug:${p.slug}` : `title:${normalizeTitle(p?.title)}`
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

const STATUS_STYLE = {
  completed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50   text-amber-700   border-amber-200',
  archived:    'bg-ink-100    text-ink-500     border-ink-200',
}

const ACCENT_COLORS = [
  'from-cobalt-600 to-cobalt-500',
  'from-amber-500 to-amber-400',
  'from-violet-600 to-violet-500',
  'from-emerald-600 to-emerald-500',
  'from-rose-500 to-rose-400',
  'from-teal-600 to-teal-500',
]

/* ── Paragraph renderer for long_description ─────────────────────── */
function renderParagraphs(text) {
  return String(text || '')
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
}

/* ── Skeleton for stacked project card ───────────────────────────── */
function ProjectCardSkeleton() {
  return (
    <div className="card p-6 sm:p-8 space-y-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-11 h-11 flex-shrink-0" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" rounded="rounded-full" />
        <Skeleton className="h-6 w-20" rounded="rounded-full" />
        <Skeleton className="h-6 w-14" rounded="rounded-full" />
      </div>
      <Skeleton className="h-48 w-full" rounded="rounded-xl" />
    </div>
  )
}

function ProjectDiagram({ src, alt, onExpand }) {
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
    <div className="rounded-xl overflow-hidden border border-ink-200 bg-white relative">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-ink-100/80" />}
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        className={`w-full h-auto max-h-[340px] object-contain p-2 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <button
        type="button"
        onClick={onExpand}
        className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                   bg-white/95 text-ink-700 border border-ink-200 shadow-sm text-xs font-semibold
                   hover:bg-white"
      >
        <Maximize2 size={12} /> Expand
      </button>
    </div>
  )
}

/* ── Single project card ─────────────────────────────────────────── */
function ProjectCard({ project, index, onDiagramPreview }) {
  const accentGradient = ACCENT_COLORS[index % ACCENT_COLORS.length]
  const paragraphs = renderParagraphs(project.long_description)
  const diagramSrc = project.architecture_diagram || project.image
  const hasDiagram = Boolean(diagramSrc)

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="card-hover rounded-2xl overflow-hidden bg-white"
    >
      {/* Accent gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${accentGradient}`} />

      <div className="p-5 sm:p-7 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className={hasDiagram ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}>
          {/* ── Header row ─────────────────────────────────────────────── */}
          <div className="flex items-start gap-4 mb-1">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-white text-sm font-black">{String(index + 1).padStart(2, '0')}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-black text-ink-900 text-lg leading-snug">{project.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLE[project.status] || STATUS_STYLE.completed}`}>
                  {(project.status || 'completed').replace('_', ' ')}
                </span>
                {project.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 text-ink-600 hover:text-ink-900 hover:border-ink-300 text-xs font-semibold transition-colors">
                  <Github size={13} /> Code
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cobalt-200 bg-cobalt-50 text-cobalt-700 hover:bg-cobalt-100 text-xs font-semibold transition-colors">
                  <ExternalLink size={13} /> Live
                </a>
              )}
            </div>
          </div>

          <p className="text-ink-600 text-sm leading-relaxed">{project.description}</p>

          {paragraphs.length > 0 && (
            <div className="space-y-2">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="text-sm text-ink-500 leading-relaxed whitespace-pre-line">{para}</p>
              ))}
            </div>
          )}

          {project.architecture_notes && (
            <div className="rounded-xl bg-ink-50/70 border border-ink-100 p-4">
              <p className="text-xs tracking-wide text-ink-500 font-bold mb-2">Architecture Notes</p>
              <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">{project.architecture_notes}</p>
            </div>
          )}

          {project.tech_stack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tech_stack.map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}

          <div className="flex sm:hidden items-center gap-3 pt-3 border-t border-ink-100">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer"
                 className="flex items-center gap-1.5 text-ink-500 hover:text-ink-900 text-sm font-medium transition-colors">
                <Github size={14} /> Code
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noreferrer"
                 className="flex items-center gap-1.5 text-ink-500 hover:text-cobalt-600 text-sm font-medium transition-colors">
                <ExternalLink size={14} /> Live
              </a>
            )}
          </div>
        </div>

        {hasDiagram && (
          <div className="lg:col-span-5 mt-4 lg:mt-0">
            <ProjectDiagram
              src={diagramSrc}
              alt={`${project.title} architecture`}
              onExpand={() => onDiagramPreview({
                src: diagramSrc,
                title: project.title,
                caption: project.architecture_caption || '',
              })}
            />
            {project.architecture_caption && (
              <p className="px-2 pt-2 text-xs text-ink-500 italic">{project.architecture_caption}</p>
            )}
          </div>
        )}
      </div>
    </motion.article>
  )
}

/* ── Main Projects section ───────────────────────────────────────── */
export default function Projects({ limit, showAll = false }) {
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [diagramPreview, setDiagramPreview] = useState(null)

  useEffect(() => {
    const params = limit ? { featured: true } : {}
    Promise.all([getProjects(params), getProfile()])
      .then(([projectRes, profileRes]) => {
        const data = projectRes.data.results || projectRes.data
        setProjects(dedupeProjects(Array.isArray(data) ? data : []))
        setProfile(profileRes.data)
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [limit])

  if (loading) return (
    <section id="projects" className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeaderSkeleton />
        <div className="space-y-5">
          {Array.from({ length: limit || 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      </div>
    </section>
  )

  const filtered = limit ? projects.filter(p => p.featured) : projects
  const list = showAll ? filtered : filtered.slice(0, limit || 6)
  const sectionBadge = String(profile?.projects_section_badge || 'Portfolio').trim() || 'Portfolio'
  const sectionTitle = String(profile?.projects_section_title || 'Projects & Initiatives').trim() || 'Projects & Initiatives'
  const sectionIntro = String(profile?.projects_section_intro || 'Large-scale migrations, automation frameworks, and full-stack systems built in production.').trim()
  const emptyText = String(profile?.projects_empty_text || 'Projects coming soon.').trim() || 'Projects coming soon.'
  const viewAllLabel = String(profile?.projects_view_all_label || 'View All Projects').trim() || 'View All Projects'

  return (
    <section id="projects" className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">{sectionBadge}</span>
          <h2 className="section-title mt-3">{sectionTitle}</h2>
          {sectionIntro && <p className="mt-3 text-ink-500 max-w-xl">{sectionIntro}</p>}
        </motion.div>

        {list.length === 0 ? (
          <div className="text-center text-ink-400 py-20">
            <p className="text-lg">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {list.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onDiagramPreview={setDiagramPreview}
              />
            ))}
          </div>
        )}

        {!showAll && projects.length > (limit || 3) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <Link to="/projects" className="btn-outline">
              {viewAllLabel}
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}
      </div>

      {/* ── Diagram lightbox ───────────────────────────────────────── */}
      <AnimatePresence>
        {diagramPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-ink-900/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDiagramPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-white shadow-2xl border border-white/30"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setDiagramPreview(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-white/90 text-ink-700 border border-ink-200
                           flex items-center justify-center hover:bg-white"
                aria-label="Close diagram preview"
              >
                <X size={16} />
              </button>

              <div className="px-5 py-4 border-b border-ink-200 bg-ink-50/70">
                <h3 className="text-base sm:text-lg font-bold text-ink-900">{diagramPreview.title} — Architecture</h3>
                {diagramPreview.caption && (
                  <p className="text-sm text-ink-500 mt-1">{diagramPreview.caption}</p>
                )}
              </div>

              <div className="bg-ink-900/5 p-3 sm:p-5">
                <img
                  src={diagramPreview.src}
                  alt={`${diagramPreview.title} architecture diagram`}
                  className="w-full max-h-[72vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
