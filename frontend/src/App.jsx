import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomeView from './views/HomeView'
import BlogListView from './views/BlogListView'
import BlogPostView from './views/BlogPostView'
import ProjectsView from './views/ProjectsView'
import ActivitiesView from './views/ActivitiesView'

export default function App() {
  return (
    <BrowserRouter>
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
