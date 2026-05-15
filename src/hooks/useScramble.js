import { useState, useEffect, useRef } from 'react'

const CHARS = '!<>-_/\\[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function useScramble(text, trigger = true, speed = 28) {
  const [output, setOutput] = useState(text)
  const frameRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!trigger) return

    frameRef.current = 0
    clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      const f = frameRef.current
      const totalFrames = text.length * 3

      setOutput(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < f / 3) return char
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )

      frameRef.current++
      if (f >= totalFrames) {
        clearInterval(intervalRef.current)
        setOutput(text)
      }
    }, speed)

    return () => clearInterval(intervalRef.current)
  }, [trigger, text, speed])

  return output
}
