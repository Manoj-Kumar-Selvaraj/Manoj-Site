import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import ArchitectureDetails from '../components/ArchitectureDetails'
import CurrentFocus from '../components/CurrentFocus'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Blog from '../components/Blog'
import Certifications from '../components/Certifications'
import HowIWork from '../components/HowIWork'
import Contact from '../components/Contact'
import { getProfile } from '../api'

export default function HomeView() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="card rounded-2xl px-6 py-5 text-center">
          <p className="text-sm sm:text-base font-semibold text-ink-800">Loading portfolio experience...</p>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">Fetching profile and platform sections</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <Hero />
      <Services />
      <About />
      <ArchitectureDetails />
      <CurrentFocus />
      <Experience />
      <Projects limit={3} />
      <Blog limit={3} />
      <Certifications />
      <HowIWork />
      <Contact />
    </>
  )
}
