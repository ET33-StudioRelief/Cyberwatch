import { gsap } from '../../utils/gsap';

/**
 * Drives the `--glow-angle` custom property consumed by `button.css` (`.button`),
 * rotating the conic-gradient ring around the element's border while hovered. Runs
 * only while hovered (paused tween, no work done otherwise) and is skipped entirely
 * under reduced motion.
 *
 * @param selector - CSS selector targeting the button element(s).
 */
export function initGlowOrbit(selector = '.button'): void {
  if (!document.querySelector(selector)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const angle = { value: 0 };
    const tween = gsap.to(angle, {
      value: 360,
      duration: 2.4,
      ease: 'none',
      repeat: -1,
      paused: true,
      onUpdate: () => el.style.setProperty('--glow-angle', `${angle.value}deg`),
    });

    el.addEventListener('mouseenter', () => tween.play());
    el.addEventListener('mouseleave', () => tween.pause());
  });
}
