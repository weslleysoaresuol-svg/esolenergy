/**
 * Lenis Smooth Scroll Helper Utility
 * Provides lightweight smooth scrolling physics and anchor navigation
 */

export interface ScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
}

/**
 * Ease Out Expo for smooth deceleration
 */
export function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/**
 * Scroll to target element or top position smoothly
 */
export function scrollToPosition(
  targetY: number,
  options: ScrollOptions = {}
): Promise<void> {
  const { duration = 800, easing = easeOutExpo, offset = 0 } = options;
  const startY = window.scrollY || window.pageYOffset;
  const destinationY = Math.max(0, targetY + offset);
  const diffY = destinationY - startY;

  if (diffY === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let startTime: number | null = null;

    function step(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easing(progress);

      window.scrollTo(0, startY + diffY * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/**
 * Smooth scroll to element selector by ID
 */
export function scrollToAnchor(
  selector: string,
  options: ScrollOptions = {}
): Promise<void> {
  const element = document.querySelector(selector);
  if (!element) return Promise.resolve();

  const rect = element.getBoundingClientRect();
  const targetY = rect.top + window.pageYOffset;
  return scrollToPosition(targetY, options);
}

/**
 * Get current scroll progress (0.0 to 1.0)
 */
export function getScrollProgress(): number {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (totalHeight <= 0) return 0;
  return Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
}
