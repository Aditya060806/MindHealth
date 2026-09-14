import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

/* ─────────────────────────────────────────────────────────────────────────
   CinematicTransition — full-screen dark panel wipe between routes.

   Corrected sequence (fixes initial-load stuck preloader):
     ENTER (new page mounts):
       panel: scaleY 1 → 0   (starts covering screen, slides UP to reveal)
       content: opacity 0 → 1 after 1.4s delay (fades in once panel is gone)
     EXIT (old page unmounts):
       content: opacity → 0 immediately
       panel: scaleY 0 → 1   (slides UP from bottom to cover old page)

   This means ANY initial page load also auto-reveals after ~1.5s — no stuck
   preloader because "animate" = reveal, not "cover".
───────────────────────────────────────────────────────────────────────── */

const ease = [0.76, 0, 0.24, 1]

const panelVariants = {
    // When a new page mounts: panel is FULLY covering the screen to start
    initial: {
        scaleY: 1,
        transformOrigin: 'top',
    },
    // Animate: panel slides UP off screen, revealing the page beneath
    animate: {
        scaleY: 0,
        transformOrigin: 'top',
        transition: { duration: 0.55, ease, delay: 0.1 },
    },
    // Exit: panel slides UP from bottom, covering screen before old page leaves
    exit: {
        scaleY: 1,
        transformOrigin: 'bottom',
        transition: { duration: 0.42, ease },
    },
}

const contentVariants = {
    // Content hidden while panel is covering
    initial: { opacity: 0 },
    // Content fades in after panel has retracted (~0.65s total)
    animate: {
        opacity: 1,
        transition: { duration: 0.45, delay: 0.65, ease: 'easeOut' },
    },
    // Content fades out immediately when leaving
    exit: {
        opacity: 0,
        transition: { duration: 0.18, ease: 'easeIn' },
    },
}

export default function CinematicTransition({ children }) {
    const location = useLocation()

    return (
        <>
            {/* Page content — fades in after panel clears */}
            <motion.div
                key={location.pathname + '-content'}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ width: '100%', minHeight: '100vh' }}
            >
                {children}
            </motion.div>

            {/* Dark wipe panel — on top, pointer-events none so it never blocks clicks */}
            <motion.div
                key={location.pathname + '-panel'}
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9000,
                    pointerEvents: 'none',
                    background: '#f8fafc',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                }}
            >
                {/* Emerald leading-edge glow at the bottom of the panel */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                    boxShadow: '0 0 20px 2px rgba(16,185,129,0.4)',
                }} />

                {/* Brand mark centred on the panel */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#059669',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    userSelect: 'none',
                }}>
                    MindHealth
                </div>
            </motion.div>
        </>
    )
}
