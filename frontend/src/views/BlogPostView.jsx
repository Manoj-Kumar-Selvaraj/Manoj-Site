import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import { getBlogPost } from '../api'

export default function BlogPostView() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getBlogPost(slug)
      .then(r => setPost(r.data))
      .catch(() => setError(true))
  }, [slug])

  if (error) return (
    <div className="pt-32 text-center text-slate-500 min-h-screen">
      <p>Post not found.</p>
      <Link to="/blog" className="text-cyan-400 hover:underline mt-4 block">← Back to Blog</Link>
    </div>
  )

  if (!post) return (
    <div className="pt-32 text-center min-h-screen">
      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
    </div>
  )

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          {post.cover_image && (
            <img src={post.cover_image} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {(post.tags || []).map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-slate-600 text-sm mb-8 pb-8 border-b border-white/10">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {post.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                {post.views} views
              </span>
            )}
          </div>

          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-slate-400 prose-p:leading-relaxed
            prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-dark-800 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
            prose-blockquote:border-cyan-500 prose-blockquote:text-slate-500
            prose-strong:text-white
            prose-li:text-slate-400
            prose-hr:border-white/10">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
