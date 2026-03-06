import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Tag } from 'lucide-react'
import { getBlogPosts } from '../api'

export default function BlogListView() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [allTags, setAllTags] = useState([])
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    getBlogPosts()
      .then(r => {
        const data = r.data.results || r.data
        setPosts(data)
        const tags = [...new Set(data.flatMap(p => p.tags || []))]
        setAllTags(tags)
      })
      .catch(() => {})
  }, [])

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase())
    const matchTag = !activeTag || (p.tags || []).includes(activeTag)
    return matchSearch && matchTag
  })

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="badge mb-4">Writing</span>
          <h1 className="text-4xl font-black gradient-text mb-4">Blog</h1>
          <p className="text-slate-500">Thoughts on AI evaluation, DevOps automation, and cloud engineering.</p>
        </motion.div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`badge cursor-pointer transition-all ${!activeTag ? 'border-cyan-500/50 text-cyan-400' : ''}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(t => t === tag ? null : tag)}
                className={`tag cursor-pointer transition-all ${activeTag === tag ? 'border-cyan-500 text-cyan-300' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 py-24">
            <p className="text-lg">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <a href={`/blog/${post.slug}`} className="block glass-hover rounded-2xl p-6 gradient-border group">
                  <div className="flex gap-6">
                    {post.cover_image && (
                      <img src={post.cover_image} alt={post.title} className="w-28 h-28 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(post.tags || []).map(tag => <span key={tag} className="tag text-xs">{tag}</span>)}
                      </div>
                      <h2 className="text-white font-bold text-xl mb-2 group-hover:text-cyan-400 transition-colors">{post.title}</h2>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.summary}</p>
                      <div className="text-slate-600 text-xs">
                        {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {post.views > 0 && ` · ${post.views} views`}
                      </div>
                    </div>
                  </div>
                </a>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
