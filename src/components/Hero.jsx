import { useEffect, useState } from 'react'
import ParticleScene from './ParticleScene'
import { useScramble } from '../hooks/useScramble'

const MARQUEE_ITEMS = [
  'Cinematic Video', 'VFX & Motion', 'Web Design', 'Brand Identity',
  'Cinematic Video', 'VFX & Motion', 'Web Design', 'Brand Identity',
  'Cinematic Video', 'VFX & Motion', 'Web Design', 'Brand Identity',
  'Cinematic Video', 'VFX & Motion', 'Web Design', 'Brand Identity',
]

export default function Hero() {
  const [ready, setReady] = useState(false)
  const title = useScramble('KROVE', ready, 30)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="hero" id="hero">
      <div className="hero__canvas-wrap">
        <ParticleScene />
      </div>

      <div className="hero__content">
        <div className="hero__label">
          <span className="hero__label-dot" />
          Hamburg, Germany — Est. 2016
        </div>

        <h1 className="hero__title">{title}</h1>

        <p className="hero__sub">Creative Production Agency</p>
      </div>

      <div className="hero__scroll">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>

      <div className="hero__marquee" aria-hidden="true">
        <div className="hero__marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="hero__marquee-item">
              {item}
              <span />
            </span>
          ))}
        </div>
      </div>

      <div className="hero__gradient" />
    </section>
  )
}
