import { useState } from 'react'
import { useInView } from '../hooks/useInView'

const SERVICES = [
  {
    id: '01',
    name: 'Cinematic Video',
    desc: 'From concept to final cut — we produce campaign films, brand stories, documentaries, and music videos with a cinematic eye and commercial precision.',
    tags: ['Commercials', 'Brand Films', 'Documentaries', 'Music Videos'],
  },
  {
    id: '02',
    name: 'VFX & Motion',
    desc: 'Visual effects, compositing, and motion graphics that elevate your content. We blend practical production with cutting-edge digital techniques.',
    tags: ['Visual Effects', 'Motion Graphics', 'Compositing', '3D Animation'],
  },
  {
    id: '03',
    name: 'Web Design',
    desc: 'Digital experiences designed to perform. We create immersive websites combining bold aesthetics with technical excellence — WebGL, custom interactions, and beyond.',
    tags: ['UI/UX Design', 'WebGL', 'Development', 'E-Commerce'],
  },
  {
    id: '04',
    name: 'Brand Identity',
    desc: 'Strategic brand thinking paired with distinctive visual execution. We build identities that are unmistakable, coherent, and alive across every touchpoint.',
    tags: ['Strategy', 'Visual Identity', 'Typography', 'Brand Systems'],
  },
]

export default function Services() {
  const [ref, inView] = useInView(0.1)
  const [active, setActive] = useState(null)

  return (
    <section className={`services${inView ? ' in-view' : ''}`} id="services" ref={ref}>
      <div className="container">
        <div className="services__header">
          <span className="section-tag">What we do</span>
          <a href="#contact" className="services__cta">Start a project →</a>
        </div>

        <div className="services__list">
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className={`service-item${active === i ? ' service-item--active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{ '--i': i }}
              data-hover
            >
              <div className="service-item__top">
                <span className="service-item__num">{s.id}</span>
                <h3 className="service-item__name">{s.name}</h3>
                <span className="service-item__arrow" aria-hidden="true">→</span>
              </div>
              <div className="service-item__expand">
                <p className="service-item__desc">{s.desc}</p>
                <div className="service-item__tags">
                  {s.tags.map(tag => (
                    <span key={tag} className="service-item__tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
