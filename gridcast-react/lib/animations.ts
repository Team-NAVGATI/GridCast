import { useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Reusable animation variants for common use cases
 */
export const AnimationVariants = {
  // Fade in with slide up
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Fade in with slide down
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Fade in with slide left
  fadeInLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },

  // Fade in with slide right
  fadeInRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  },

  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Stagger container for children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  // Hover effects
  hoverScale: {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 },
  },

  hoverLift: {
    whileHover: { y: -4 },
    transition: { duration: 0.2 },
  },
};

/**
 * Custom hook for scroll-triggered animations
 */
export function useScrollTrigger(options?: { once?: boolean; amount?: 'some' | 'all' | number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    amount: options?.amount ?? 'some',
  });

  return { ref, isInView };
}

/**
 * Tailwind animation utilities (CSS classes)
 */
export const AnimationClasses = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer',
  bounce: 'animate-bounce',
};

/**
 * Keyframe definitions for custom animations
 */
export const KeyframeAnimations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  slideLeft: `
    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `,
  slideRight: `
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,
  brandPulse: `
    @keyframes brandPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
  `,
  underlineGrow: `
    @keyframes underlineGrow {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
  `,
};
