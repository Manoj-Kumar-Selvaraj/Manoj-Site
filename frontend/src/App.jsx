import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomeView from './views/HomeView'
import BlogListView from './views/BlogListView'
import BlogPostView from './views/BlogPostView'
import ProjectsView from './views/ProjectsView'
import ActivitiesView from './views/ActivitiesView'
import { Spinner } from './components/ui/Skeleton'

export default function App() {
  const [bgReady, setBgReady] = useState(false)

  useEffect(() => {
    let finished = false

    const markReady = () => {
      if (finished) return
      finished = true
      setBgReady(true)
      document.body.classList.add('bg-ready')
    }

    document.body.classList.remove('bg-ready')

    const img = new Image()
    img.onload = markReady
    img.onerror = markReady
    img.src = '/bg_hero.png'

    // Fallback so UI is never blocked if the image is slow/unavailable.
    const fallbackTimer = window.setTimeout(markReady, 4500)

    return () => {
      window.clearTimeout(fallbackTimer)
      img.onload = null
      img.onerror = null
      document.body.classList.remove('bg-ready')
    }
  }, [])

  return (
    <BrowserRouter>
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0e1a]/96 transition-opacity duration-500 ${bgReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-hidden={bgReady}
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-white/70 text-sm font-medium tracking-wide">Loading background...</p>
        </div>
      </div>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/projects" element={<ProjectsView />} />
            <Route path="/blog" element={<BlogListView />} />
            <Route path="/blog/:slug" element={<BlogPostView />} />
            <Route path="/activities" element={<ActivitiesView />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
