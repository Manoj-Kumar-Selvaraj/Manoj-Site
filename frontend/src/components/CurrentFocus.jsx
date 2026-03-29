import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, ArrowRight } from 'lucide-react'
import { getCurrentFocusItems, getProfile } from '../api'
import { SectionHeaderSkeleton, CardSkeleton } from './ui/Skeleton'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.5, ease: 'easeOut' },
})

export default function CurrentFocus() {
  const [items, setItems] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCurrentFocusItems(), getProfile()])
      .then(([itemsRes, profileRes]) => {
        const data = itemsRes.data.results || itemsRes.data
        setItems(Array.isArray(data) ? data.slice(0, 4) : [])
        setProfile(profileRes.data)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="current-focus" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeaderSkeleton />
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <CardSkeleton key={item} lines={2} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!items.length) return null

  const sectionBadge = String(profile?.current_focus_section_badge || 'Current Focus').trim() || 'Current Focus'
  const sectionTitle = String(profile?.current_focus_section_title || 'What I am actively improving right now.').trim() || 'What I am actively improving right now.'
  const sectionIntro = String(profile?.current_focus_section_intro || 'The engineering areas, systems, and capabilities I am investing in at the moment.').trim()
  const ctaLabel = String(profile?.current_focus_cta_label || 'Discuss these initiatives').trim() || 'Discuss these initiatives'

  return (
    <section id="current-focus" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-8">
          <span className="section-badge mb-3">{sectionBadge}</span>
          <h2 className="section-title mt-2">{sectionTitle}</h2>
          {sectionIntro && <p className="mt-3 text-ink-500 max-w-2xl">{sectionIntro}</p>}
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <motion.article
              key={item.id || `${item.title}-${index}`}
              {...fadeUp(0.08 + index * 0.04)}
              className="card rounded-2xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cobalt-50 border border-cobalt-200 text-cobalt-700 flex items-center justify-center flex-shrink-0">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900 leading-snug">{item.title}</h3>
                  {item.note && <p className="mt-1 text-sm text-ink-600 leading-relaxed">{item.note}</p>}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div {...fadeUp(0.22)} className="mt-6">
          <a href="/#contact" className="inline-flex items-center gap-2 text-sm font-semibold text-cobalt-700 hover:text-cobalt-600">
            {ctaLabel}
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
