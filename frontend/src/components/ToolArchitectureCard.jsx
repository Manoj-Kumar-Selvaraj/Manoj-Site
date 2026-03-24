import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

function toBulletItems(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  const text = String(value || '').trim()
  if (!text) return []

  return text
    .split(/\r?\n|\u2022|\-|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function SectionList({ heading, value }) {
  const bullets = useMemo(() => toBulletItems(value), [value])

  return (
    <div className="space-y-2">
      <h4 className="text-xs uppercase tracking-wide text-ink-500 font-semibold">{heading}</h4>
      {bullets.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-ink-700 leading-relaxed">
          {bullets.map((item, index) => (
            <li key={`${heading}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-ink-500 leading-relaxed">
          <li>Placeholder</li>
        </ul>
      )}
    </div>
  )
}

export default function ToolArchitectureCard({
  title,
  role,
  setup,
  usage,
  communication,
  tradeoffs,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <article className="card rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-0.5">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left px-5 py-4 md:px-6 md:py-5"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-ink-900">{title || 'Tool Name Placeholder'}</h3>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="text-ink-500"
          >
            <ChevronDown size={18} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 md:px-6 md:pb-5 border-t border-ink-200">
              <div className="pt-4 space-y-4 max-w-3xl">
                <SectionList heading="Role in System" value={role} />
                <SectionList heading="Typical Setup" value={setup} />
                <SectionList heading="How It Works" value={usage} />
                <SectionList heading="Communication / Integration" value={communication} />
                <SectionList heading="Design Decisions / Trade-offs" value={tradeoffs} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
