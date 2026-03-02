import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, ExternalLink, Calendar } from 'lucide-react'
import { getCertifications } from '../api'

export default function Certifications() {
  const [certs, setCerts] = useState([])

  useEffect(() => {
    getCertifications().then(r => setCerts(r.data.results || r.data)).catch(() => {})
  }, [])

  if (!certs.length) return null

  return (
    <section id="certifications" className="relative py-24 bg-canvas">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-yellow-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge mb-4">Credentials</span>
          <h2 className="section-title gradient-text">Certifications</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-hover rounded-2xl p-5 gradient-border flex items-start gap-4"
            >
              {cert.image ? (
                <img src={cert.image} alt={cert.issuer} className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1.5 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Award size={20} className="text-yellow-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm leading-snug mb-1">{cert.name}</h3>
                <p className="text-slate-500 text-xs mb-2">{cert.issuer}</p>
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <Calendar size={10} />
                  <span>{new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer"
                       className="ml-auto flex items-center gap-0.5 text-cyan-500 hover:text-cyan-400 transition-colors">
                      Verify <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
