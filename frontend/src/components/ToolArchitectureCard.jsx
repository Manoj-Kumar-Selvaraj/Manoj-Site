import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/* Render text as paragraphs — preserves line breaks within paragraphs,
   splits on double-newlines for separate <p> blocks. */
function TextBlock({ text, className = '' }) {
  const content = String(text || '').trim()
  if (!content) return null

  const paras = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  return (
    <div className={`space-y-2 ${className}`}>
      {paras.map((p, i) => (
        <p key={i} className="text-sm sm:text-base text-ink-700 leading-relaxed whitespace-pre-line">{p}</p>
      ))}
    </div>
  )
}

function SectionBlock({ heading, value }) {
  const content = String(value || '').trim()
  if (!content) return null

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs uppercase tracking-wide text-ink-500 font-semibold">{heading}</h4>
      <TextBlock text={content} />
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
                <SectionBlock heading="Role in System" value={role} />
                <SectionBlock heading="Typical Setup" value={setup} />
                <SectionBlock heading="How It Works" value={usage} />
                <SectionBlock heading="Communication / Integration" value={communication} />
                <SectionBlock heading="Design Decisions / Trade-offs" value={tradeoffs} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
