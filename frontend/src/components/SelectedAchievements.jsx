import { motion } from 'framer-motion'

const ACHIEVEMENTS = [
  {
    title: 'Terraform Cloud Migration at Scale',
    desc: 'Migrated 1,000+ Terraform Enterprise workspaces to Terraform Cloud using custom Python automation.',
  },
  {
    title: 'CI/CD Platform Modernization',
    desc: 'Led migration of 15,000+ Jenkins pipelines to CloudBees CI with zero production downtime.',
  },
  {
    title: 'Multi-Account Platform Operations',
    desc: 'Operated DevOps platforms across 30+ AWS accounts and 50+ Kubernetes clusters.',
  },
  {
    title: 'High-Throughput Runners',
    desc: 'Implemented GitHub Actions ARC runners supporting 500+ CI workflows per day.',
  },
  {
    title: 'Automation Efficiency',
    desc: 'Reduced infrastructure migration effort by ~50% through repeatable automation frameworks.',
  },
  {
    title: 'Legacy Modernization',
    desc: 'Migrated 3,000+ mainframe scheduler jobs to StoneBranch using Python-based tooling.',
  },
]

export default function SelectedAchievements() {
  return (
    <section id="achievements" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="section-badge mb-4">Proof of Scale</span>
          <h2 className="section-title mt-3">Selected Achievements</h2>
          <p className="mt-3 text-ink-500 max-w-2xl">
            A quick snapshot of the systems I’ve owned and the scale I’ve delivered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-hover rounded-2xl p-6"
            >
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-cobalt-500 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-ink-900 text-sm">{a.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed mt-1">{a.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
