import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { getSkillsGrouped } from '../api'

const CATEGORY_META = {
  cloud:      { label: 'Cloud Infrastructure',         pill: 'skill-pill-cloud',      accent: 'border-l-cobalt-500',   header: 'text-cobalt-400',   num: '01', dot: 'bg-cobalt-400' },
  iac:        { label: 'Infrastructure as Code',       pill: 'skill-pill-iac',        accent: 'border-l-violet-500',   header: 'text-violet-400',   num: '02', dot: 'bg-violet-400' },
  containers: { label: 'Containers & Kubernetes',      pill: 'skill-pill-containers', accent: 'border-l-teal-500',     header: 'text-teal-400',     num: '03', dot: 'bg-teal-400' },
  devops:     { label: 'DevOps Platforms',             pill: 'skill-pill-devops',     accent: 'border-l-orange-500',   header: 'text-orange-400',   num: '04', dot: 'bg-orange-400' },
  python:     { label: 'Programming & Automation',     pill: 'skill-pill-python',     accent: 'border-l-emerald-500',  header: 'text-emerald-400',  num: '05', dot: 'bg-emerald-400' },
}

const PROFICIENCY_LABEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' }

function isDirectIconSource(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('/') || value.startsWith('data:')
}

function resolveIconSource(skill) {
  const uploaded = String(skill?.icon_upload || '').trim()
  if (uploaded) return uploaded

  const explicit = String(skill?.icon || '').trim()
  return explicit
}

function SkillIcon({ skill, dot }) {
  const [failed, setFailed] = useState(false)
  const source = resolveIconSource(skill)
  const iconUrl = source && !isDirectIconSource(source)
    ? `https://cdn.simpleicons.org/${source}`
    : source

  if (!iconUrl || failed) {
    return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
  }
  return (
    <div className="w-7 h-7 rounded-md bg-white border border-ink-100 shadow-sm flex items-center justify-center flex-shrink-0">
      <img
        src={iconUrl}
        alt={skill.name}
        className="w-[18px] h-[18px] object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function Skills() {
  const [groups, setGroups] = useState([])

  useEffect(() => {
    getSkillsGrouped()
      .then(r => setGroups(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
  }, [])

  const orderedGroups = useMemo(() => {
    const copy = Array.isArray(groups) ? [...groups] : []
    const filtered = copy.filter(g => g.category !== 'ai_llm')
    const order = (category) => {
      const num = CATEGORY_META[category]?.num
      return num ? Number.parseInt(num, 10) : 999
    }
    filtered.sort((a, b) => order(a.category) - order(b.category))
    return filtered
  }, [groups])

  if (!orderedGroups.length) return null

  return (
    <section id="skills" className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="section-badge mb-4">Technical Skills</span>
          <h2 className="section-title mt-3">
            The tools behind the work
          </h2>
          <p className="mt-3 text-ink-500 max-w-lg">
            Technologies I use daily to build, operate, and scale cloud infrastructure and DevOps platforms.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orderedGroups.map((group, gi) => {
            const meta = CATEGORY_META[group.category] || CATEGORY_META.cloud
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.06 }}
                className={`card rounded-2xl overflow-hidden border-l-4 ${meta.accent}`}
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-ink-100">
                  <h3 className={`font-bold text-sm ${meta.header}`}>{group.label}</h3>
                  <span className="text-3xl font-black text-ink-200 leading-none">{meta.num}</span>
                </div>

                {/* Skill rows */}
                <div className="px-4 pb-4 pt-1">
                  {group.skills.map(skill => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-ink-50 transition-colors cursor-default"
                      title={PROFICIENCY_LABEL[skill.proficiency]}
                    >
                      <SkillIcon skill={skill} dot={meta.dot} />
                      <span className="text-sm font-medium text-ink-800 flex-1 leading-tight">{skill.name}</span>
                      {skill.proficiency === 4 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Expert" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex items-center gap-3 text-xs text-ink-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Gold dot = Expert proficiency</span>
        </motion.div>
      </div>
    </section>
  )
}
