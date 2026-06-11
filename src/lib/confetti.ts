import confetti from 'canvas-confetti'

/** Small celebratory burst, optionally tinted to a goal's accent color. */
export function celebrate(color?: string) {
  const colors = color ? [color, '#ffffff', '#c4b5fd'] : ['#8b5cf6', '#22d3ee', '#34d399']
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 32,
    gravity: 0.9,
    scalar: 0.9,
    ticks: 140,
    origin: { y: 0.7 },
    colors,
  })
}
