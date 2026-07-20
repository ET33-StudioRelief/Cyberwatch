import { gsap } from '../../utils/gsap';

/**
 * Fills each `.step_line` vertical bar from 0% to 100% height as its
 * `.step_content` block scrolls through the viewport, giving the impression
 * that the timeline draws itself in as the user reads through the steps.
 *
 * @param selector - CSS selector targeting each step block.
 */
export function initStepLines(selector = '.step_content'): void {
  const steps = gsap.utils.toArray<HTMLElement>(selector);
  if (steps.length === 0) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    steps.forEach((step) => {
      const line = step.querySelector<HTMLElement>('.step_line');
      if (!line) return;

      gsap.fromTo(
        line,
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: step,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        }
      );
    });
  });
}
