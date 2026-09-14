import React, { useEffect, useRef } from 'react'

const PALETTE = [
    'rgba(16, 185, 129, 0.22)',  // emerald
    'rgba(13, 148, 136, 0.20)',  // teal
    'rgba(5, 150, 105, 0.25)',   // deep emerald
    'rgba(52, 211, 153, 0.18)',  // mint
    'rgba(20, 184, 166, 0.22)',  // cyan-teal
]

export default function Particles() {
    const ref = useRef(null)

    useEffect(() => {
        const container = ref.current
        if (!container) return

        const particles = []
        const count = 28

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div')
            p.className = 'particle'
            const size = Math.random() * 7 + 3
            const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
            const driftX = (Math.random() * 60 - 30).toFixed(1) + 'px'
            const duration = (Math.random() * 14 + 12).toFixed(1) + 's'
            const delay = (Math.random() * 12).toFixed(1) + 's'
            const opacity = (Math.random() * 0.35 + 0.15).toFixed(2)
            const blur = size > 6 ? '1px' : '0px'

            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 100}%;
                background: ${color};
                animation-duration: ${duration};
                animation-delay: ${delay};
                --p-opacity: ${opacity};
                --drift-x: ${driftX};
                filter: blur(${blur});
            `
            container.appendChild(p)
            particles.push(p)
        }
        return () => particles.forEach(p => p.remove())
    }, [])

    return <div ref={ref} className="particles-bg" />
}
