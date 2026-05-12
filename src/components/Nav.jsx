import { useEffect, useState } from 'react'
import { useScramble } from '../hooks/useScramble'

const LINKS = ['Services', 'Work', 'About', 'Contact']

export default function Nav() {
  const [scrolled, setScrolled]   = useState(false)
  const [open, setOpen]           = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const logo = useScramble('KROVE', logoHover, 40)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}${open ? ' nav--open' : ''}`}>
        <a
          href="#hero"
          className="nav__logo"
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          onClick={close}
        >
          {logo}
        </a>

        {/* Desktop links */}
        <div className="nav__links">
          {LINKS.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="nav__link">
              {link}
            </a>
          ))}
        </div>

        <a href="#contact" className="nav__cta" onClick={close}>
          <span>Get in touch</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Hamburger */}
        <button
          className="nav__burger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span />
          <span />
        </button>
      </nav>

      {/* Full-screen mobile overlay */}
      <div className={`nav__mobile${open ? ' nav__mobile--open' : ''}`} aria-hidden={!open}>
        <div className="nav__mobile-inner">
          <nav className="nav__mobile-links">
            {LINKS.map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="nav__mobile-link"
                style={{ '--i': i }}
                onClick={close}
              >
                <span className="nav__mobile-num">0{i + 1}</span>
                {link}
              </a>
            ))}
          </nav>

          <div className="nav__mobile-footer">
            <a href="#contact" className="nav__mobile-cta" onClick={close}>
              Get in touch →
            </a>
            <span className="nav__mobile-location">Hamburg, Germany</span>
          </div>
        </div>
      </div>
    </>
  )
}
