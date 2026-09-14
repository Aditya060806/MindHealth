import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Brain } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   CinematicTransition — full-screen light wipe with emerald accent between routes.
───────────────────────────────────────────────────────────────────────── */

const ease = [0.76, 0, 0.24, 1]

const panelVariants = {
    initial: {
        scaleY: 1,
        transformOrigin: 'top',
    },
    animate: {
        scaleY: 0,
        transformOrigin: 'top',
        transition: { duration: 0.55, ease, delay: 0.1 },
    },
    exit: {
        scaleY: 1,
        transformOrigin: 'bottom',
        transition: { duration: 0.42, ease },
    },
}

const contentVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.45, delay: 0.65, ease: 'easeOut' },
    },
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

            {/* Wipe panel — on top, pointer-events none so it never blocks clicks */}
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

                {/* Brand mark badge centred on the panel */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    userSelect: 'none',
                }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    }}>
                        <Brain size={18} color="#ffffff" />
                    </div>
                    <span style={{
                        color: '#0f172a',
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    }}>
                        Mind<span style={{ color: '#059669' }}>Health</span>
                    </span>
                </div>
            </motion.div>
        </>
    )
}
