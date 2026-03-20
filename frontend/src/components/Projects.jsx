import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Github, ExternalLink, ArrowRight } from 'lucide-react'
import { getProjects } from '../api'

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

  useEffect(() => {
    const params = limit ? { featured: true } : {}
    getProjects(params)
      .then(r => {
        const data = r.data.results || r.data
        setProjects(dedupeProjects(Array.isArray(data) ? data : []))
      })
      .catch(() => setProjects([]))
  }, [limit])

  const filtered = limit ? projects.filter(p => p.featured) : projects
  const list = showAll ? filtered : filtered.slice(0, limit || 6)

  return (
    <section id="projects" className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">Portfolio</span>
          <h2 className="section-title mt-3">Projects &amp; Initiatives</h2>
          <p className="mt-3 text-ink-500 max-w-xl">
            Large-scale migrations, automation frameworks, and full-stack systems built in production.
          </p>
        </motion.div>

        {list.length === 0 ? (
          <div className="text-center text-ink-400 py-20">
            <p className="text-lg">Projects coming soon.</p>
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
              View All Projects
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
