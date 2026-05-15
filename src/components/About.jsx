import { useInView } from '../hooks/useInView'

const STATS = [
  { num: '8+',   label: 'Years of craft' },
  { num: '200+', label: 'Projects delivered' },
  { num: '60+',  label: 'Global clients' },
]

export default function About() {
  const [ref, inView] = useInView(0.2)

  return (
    <section className={`about${inView ? ' in-view' : ''}`} id="about" ref={ref}>
      <div className="container">
        <div className="about__grid">
          <div className="about__left">
            <span className="section-tag">About KROVE</span>
            <h2 className="about__headline">
              We craft visual<br />
              stories that<br />
              <em>move</em> people.
            </h2>
          </div>

          <div className="about__right">
            <p className="about__text">
              KROVE is an independent creative production studio operating at the
              intersection of cinema, technology, and design. We partner with ambitious
              brands to produce work that demands attention — and refuses to be ignored.
            </p>
            <p className="about__text">
              Based in Hamburg, working worldwide — from campaign films and visual effects
              to immersive digital experiences and complete brand systems.
            </p>

            <div className="about__stats">
              {STATS.map(({ num, label }) => (
                <div key={label} className="about__stat">
                  <span className="about__stat-num">{num}</span>
                  <span className="about__stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
