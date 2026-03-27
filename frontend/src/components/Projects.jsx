import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Github, ExternalLink, ArrowRight, ChevronDown, ChevronUp, Maximize2, X } from 'lucide-react'
import { getProfile, getProjects } from '../api'
import { SectionHeaderSkeleton, CardsGridSkeleton } from './ui/Skeleton'

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
  'bg-cobalt-600', 'bg-amber-500', 'bg-violet-600',
  'bg-emerald-600', 'bg-rose-500', 'bg-teal-600',
]

export default function Projects({ limit, showAll = false }) {
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedProjectIds, setExpandedProjectIds] = useState([])
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
        <CardsGridSkeleton count={limit || 3} />
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

  const toggleExpanded = (projectId) => {
    setExpandedProjectIds((current) => {
      if (current.includes(projectId)) {
        return current.filter((id) => id !== projectId)
      }
      return [...current, projectId]
    })
  }

  const renderParagraphs = (text) => {
    return String(text || '')
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
  }

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((project, i) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card-hover rounded-2xl overflow-hidden flex flex-col group"
              >
                {/* Colored accent bar + project number */}
                <div className={`h-1.5 ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`} />

                {(project.architecture_diagram || project.image) && (
                  <div className="relative bg-ink-900/5 border-b border-ink-100">
                    <img
                      src={project.architecture_diagram || project.image}
                      alt={`${project.title} architecture`}
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setDiagramPreview({
                        src: project.architecture_diagram || project.image,
                        title: project.title,
                        caption: project.architecture_caption || '',
                      })}
                      className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                                 bg-white/90 text-ink-700 border border-white shadow-sm text-xs font-semibold
                                 hover:bg-white"
                    >
                      <Maximize2 size={12} />
                      Diagram
                    </button>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-black text-ink-900 text-base leading-snug group-hover:text-cobalt-600 transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[project.status] || STATUS_STYLE.completed}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        {project.featured && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-3xl font-black text-ink-100 leading-none flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-4">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  {project.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech_stack.slice(0, 5).map(t => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                      {project.tech_stack.length > 5 && (
                        <span className="tag">+{project.tech_stack.length - 5}</span>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpanded(project.id)}
                    className="mt-auto mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700 hover:text-cobalt-600"
                  >
                    {expandedProjectIds.includes(project.id) ? (
                      <>
                        Less details
                        <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        More details
                        <ChevronDown size={14} />
                      </>
                    )}
                  </button>

                  {expandedProjectIds.includes(project.id) && (
                    <div className="mb-4 rounded-xl border border-ink-200 bg-ink-50/60 p-4 space-y-3">
                      {renderParagraphs(project.long_description).length > 0 ? (
                        <div className="space-y-2 text-sm text-ink-600 leading-relaxed">
                          {renderParagraphs(project.long_description).map((para, idx) => (
                            <p key={`${project.id}-desc-${idx}`}>{para}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-ink-500 leading-relaxed">
                          Add long description in admin to show implementation highlights, architecture decisions, and outcomes.
                        </p>
                      )}

                      {project.architecture_notes && (
                        <div className="pt-2 border-t border-ink-200">
                          <p className="text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1.5">Architecture Notes</p>
                          <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">{project.architecture_notes}</p>
                        </div>
                      )}

                      {project.architecture_caption && (
                        <p className="text-xs text-ink-500 italic">{project.architecture_caption}</p>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-3 border-t border-ink-100">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noreferrer"
                         className="flex items-center gap-1.5 text-ink-500 hover:text-ink-900 text-sm font-medium transition-colors">
                        <Github size={14} />
                        Code
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noreferrer"
                         className="flex items-center gap-1.5 text-ink-500 hover:text-cobalt-600 text-sm font-medium transition-colors">
                        <ExternalLink size={14} />
                        Live
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
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

      {diagramPreview && (
        <div className="fixed inset-0 z-[70] bg-ink-900/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-white shadow-2xl border border-white/30">
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
              <h3 className="text-base sm:text-lg font-bold text-ink-900">{diagramPreview.title} - Architecture Diagram</h3>
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
          </div>
        </div>
      )}
    </section>
  )
}
