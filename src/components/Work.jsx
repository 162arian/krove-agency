import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

const PROJECTS = [
  {
    title: 'Phantom',
    client: 'Luxury Automotive',
    category: 'Campaign Film',
    year: '2024',
    bg: 'radial-gradient(ellipse at 35% 45%, #031428 0%, #000408 65%)',
    glow: '#3888c8',
    span: 'narrow',
  },
  {
    title: 'Noor',
    client: 'Haute Parfumerie',
    category: 'Brand Film',
    year: '2024',
    bg: 'radial-gradient(ellipse at 65% 30%, #021020 0%, #000306 65%)',
    glow: '#60b0e0',
    span: 'narrow',
  },
  {
    title: 'Helix',
    client: 'Biotech Startup',
    category: 'Web Design & Dev',
    year: '2023',
    bg: 'radial-gradient(ellipse at 50% 60%, #021824 0%, #000508 65%)',
    glow: '#20c8f0',
    span: 'wide',
  },
  {
    title: 'Atlas',
    client: 'Architecture Studio',
    category: 'Brand Identity',
    year: '2023',
    bg: 'radial-gradient(ellipse at 25% 35%, #030c20 0%, #000208 65%)',
    glow: '#4898d8',
    span: 'narrow',
  },
  {
    title: 'Obsidian',
    client: 'Fashion Label',
    category: 'VFX & Motion',
    year: '2023',
    bg: 'radial-gradient(ellipse at 70% 55%, #02101e 0%, #000306 65%)',
    glow: '#80c4f0',
    span: 'narrow',
  },
]

function ProjectCard({ project, index }) {
  const [ref, inView] = useInView(0.1)

  const onMouseEnter = () => {
    const card = ref.current
    if (!card || window.matchMedia('(hover: none)').matches) return
    card.style.willChange = 'transform'
  }

  const onMouseMove = (e) => {
    const card = ref.current
    if (!card || window.matchMedia('(hover: none)').matches) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    card.style.transition = 'transform 0.08s ease'
    card.style.transform  = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`
  }

  const onMouseLeave = () => {
    const card = ref.current
    if (!card) return
    card.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)'
    card.style.transform  = ''
    card.style.willChange = 'auto'
  }

  return (
    <div
      ref={ref}
      className={`project-card project-card--${project.span}${inView ? ' in-view' : ''}`}
      style={{ '--i': index }}
      data-hover
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="project-card__visual" style={{ background: project.bg }}>
        <div className="project-card__glow" style={{ background: project.glow }} />
        <div className="project-card__grid-lines" />
        <div className="project-card__overlay">
          <span className="project-card__view">View Project →</span>
        </div>
      </div>
      <div className="project-card__info">
        <div>
          <h3 className="project-card__title">{project.title}</h3>
          <span className="project-card__client">{project.client}</span>
        </div>
        <div className="project-card__meta">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
      </div>
    </div>
  )
}

export default function Work() {
  const [ref, inView] = useInView(0.1)

  return (
    <section className={`work${inView ? ' in-view' : ''}`} id="work" ref={ref}>
      <div className="container">
        <div className="work__header">
          <span className="section-tag">Selected work</span>
          <h2 className="work__headline">Recent Projects</h2>
        </div>

        <div className="work__grid">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>

        <div className="work__footer">
          <a href="#contact" className="work__all-link" data-hover>
            <span>View all work</span>
            <span className="work__all-line" />
          </a>
        </div>
      </div>
    </section>
  )
}
