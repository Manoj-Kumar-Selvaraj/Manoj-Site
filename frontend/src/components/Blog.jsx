import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getBlogPosts, getProfile } from '../api'

export default function Blog({ limit }) {
  const [posts, setPosts] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    Promise.all([getBlogPosts(), getProfile()])
      .then(([postRes, profileRes]) => {
        const data = postRes.data.results || postRes.data
        setPosts(limit ? data.slice(0, limit) : data)
        setProfile(profileRes.data)
      })
      .catch(() => {})
  }, [limit])

  if (!posts.length) return null

  const sectionBadge = String(profile?.blog_section_badge || 'Writing').trim() || 'Writing'
  const sectionTitle = String(profile?.blog_section_title || 'Latest Posts').trim() || 'Latest Posts'
  const sectionIntro = String(profile?.blog_section_intro || 'Thoughts on AI, DevOps, cloud infrastructure and engineering.').trim()
  const viewAllLabel = String(profile?.blog_view_all_label || 'Read All Posts').trim() || 'Read All Posts'

  return (
    <section id="blog" className="relative py-24 bg-canvas">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-pink-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge mb-4">{sectionBadge}</span>
          <h2 className="section-title gradient-text">{sectionTitle}</h2>
          {sectionIntro && <p className="mt-4 text-slate-500">{sectionIntro}</p>}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/blog/${post.slug}`} className="block h-full glass-hover rounded-2xl overflow-hidden group gradient-border">
                {post.cover_image && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-white font-bold mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                    {post.summary}
                  </p>
                  <div className="flex items-center gap-3 text-slate-600 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {post.views > 0 && <span>· {post.views} views</span>}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {limit && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/blog" className="btn-ghost">
              {viewAllLabel}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
