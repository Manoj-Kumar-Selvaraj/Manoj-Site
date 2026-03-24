import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getToolArchitectures } from '../api'
import ToolArchitectureCard from './ToolArchitectureCard'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: 'easeOut' },
})

export default function ArchitectureDetails() {
  const [tools, setTools] = useState([])

  useEffect(() => {
    getToolArchitectures()
      .then((res) => {
        const payload = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
            ? res.data.results
            : []
        setTools(payload)
      })
      .catch(() => {})
  }, [])

  return (
    <section id="architecture" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="mb-8 max-w-3xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Platform Architecture &amp; Tooling in Practice</h2>
        </motion.div>

        <motion.div
          {...fadeUp(0.04)}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:bg-white/15 hover:border-white/30 hover:-translate-y-0.5 px-5 py-4 md:px-6 md:py-5 mb-4"
        >
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-base sm:text-lg font-semibold text-white">System Overview</h3>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">
              Placeholder overview describing how platform components are structured and how tooling supports
              delivery, observability, and runtime operations.
            </p>
            <div className="h-40 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/40 text-sm">
              Architecture diagram placeholder
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          {tools.map((tool, index) => (
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

          {tools.length === 0 && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl px-5 py-4 md:px-6 md:py-5">
              <div className="max-w-3xl space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">ToolArchitecture entries required</h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  Add Tool Architecture records in admin to populate this section.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
