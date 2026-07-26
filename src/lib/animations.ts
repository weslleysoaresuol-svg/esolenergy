import { Variants, Transition } from "framer-motion";

/**
 * Transition Spring Configurations
 */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 15,
};

export const transitionSmooth: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * Stagger Container Variant for List & Grid Children
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Fade Up Entry Variant
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitionSmooth,
  },
};

/**
 * Fade In Entry Variant
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.25 },
  },
};

/**
 * Scale Up Entry Variant (Modals, Cards & Badges)
 */
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
};

/**
 * Slide In Left Variant
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: transitionSmooth,
  },
};

/**
 * Slide In Right Variant
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: transitionSmooth,
  },
};

/**
 * 3D Mouse Hover Tilt Calculator
 * Calculates rotateX and rotateY based on mouse position inside bounding rectangle
 */
export function calculate3DTilt(
  event: React.MouseEvent<HTMLElement>,
  maxRotate: number = 10
): { rotateX: number; rotateY: number } {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const rotateX = ((mouseY / height) - 0.5) * -maxRotate * 2;
  const rotateY = ((mouseX / width) - 0.5) * maxRotate * 2;

  return { rotateX, rotateY };
}
