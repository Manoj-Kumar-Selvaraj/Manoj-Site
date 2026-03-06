import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import CurrentFocus from '../components/CurrentFocus'
import Skills from '../components/Skills'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Blog from '../components/Blog'
import Certifications from '../components/Certifications'
import HowIWork from '../components/HowIWork'
import Contact from '../components/Contact'

export default function HomeView() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <CurrentFocus />
      <Skills />
      <Experience />
      <Projects limit={3} />
      <Blog limit={3} />
      <Certifications />
      <HowIWork />
      <Contact />
    </>
  )
}
