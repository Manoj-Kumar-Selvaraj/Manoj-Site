import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, ArrowRight } from 'lucide-react'
import { getCurrentFocusItems } from '../api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.5, ease: 'easeOut' },
})

export default function CurrentFocus() {
  const [items, setItems] = useState([])

  useEffect(() => {
    getCurrentFocusItems()
      .then((res) => setItems(Array.isArray(res.data) ? res.data.slice(0, 4) : []))
      .catch(() => {})
  }, [])

  if (!items.length) return null

  return (
    <section id="current-focus" className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-8">
          <span className="section-badge mb-3">Current Focus</span>
          <h2 className="section-title mt-2">
            What I am actively improving<br />
            <span className="text-cobalt-600">right now.</span>
          </h2>
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
            Discuss these initiatives
            <ArrowRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
