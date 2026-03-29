import Hero from '../components/Hero'
import About from '../components/About'
import ArchitectureDetails from '../components/ArchitectureDetails'
import CurrentFocus from '../components/CurrentFocus'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Blog from '../components/Blog'
import Contact from '../components/Contact'

export default function HomeView() {
  return (
    <>
      <Hero />
      <About />
      <ArchitectureDetails />
      <CurrentFocus />
      <Experience />
      <Projects limit={3} />
      <Blog limit={3} />
      <Contact />
    </>
  )
}
