import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useScramble } from '../hooks/useScramble'

const SOCIAL = ['Instagram', 'Vimeo', 'LinkedIn', 'Behance']

export default function Contact() {
  const [ref, inView] = useInView(0.15)
  const [emailHover, setEmailHover] = useState(false)
  const email = useScramble('hello@krove.studio', emailHover, 22)

  return (
    <section className={`contact${inView ? ' in-view' : ''}`} id="contact" ref={ref}>
      <div className="container">
        <div className="contact__content">
          <span className="section-tag">Get in touch</span>

          <h2 className="contact__headline">
            Let's create<br />
            something<br />
            <span className="contact__accent">remarkable.</span>
          </h2>

          <div className="contact__links">
            <a
              href="mailto:hello@krove.studio"
              className="contact__email"
              onMouseEnter={() => setEmailHover(true)}
              onMouseLeave={() => setEmailHover(false)}
              data-hover
            >
              {email}
            </a>

            <div className="contact__social">
              {SOCIAL.map(s => (
                <a key={s} href="#" className="contact__social-link" data-hover>{s}</a>
              ))}
            </div>
          </div>

          <div className="contact__location">
            <span>Hamburg, Germany</span>
            <span>Open to worldwide projects</span>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <span className="footer__logo">KROVE</span>
            <span className="footer__copy">© 2024 KROVE Studio. All rights reserved.</span>
            <nav className="footer__nav">
              <a href="#" data-hover>Impressum</a>
              <a href="#" data-hover>Datenschutz</a>
            </nav>
          </div>
        </div>
      </footer>
    </section>
  )
}
