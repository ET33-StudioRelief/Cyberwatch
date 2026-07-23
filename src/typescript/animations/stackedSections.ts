import { gsap } from '../../utils/gsap';

/** Facteur de réduction appliqué à l'étape précédente une fois recouverte. */
const SCALE_DOWN = 0.92;

export function initStackedSections(
  wrapperSelector = '.section-wrapper',
  stepSelector = '.section_step'
): void {
  const wrapper = document.querySelector<HTMLElement>(wrapperSelector);
  if (!wrapper) return;

  const steps = gsap.utils.toArray<HTMLElement>(stepSelector, wrapper);
  if (steps.length < 2) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    steps.forEach((step, i) => {
      const getOverflow = (): number => Math.max(step.offsetHeight - window.innerHeight, 0);

      gsap.to(step, {
        y: () => -getOverflow(),
        ease: 'none',
        scrollTrigger: {
          trigger: step,
          start: 'top top',
          end: () => `+=${getOverflow()}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      if (i === 0) return;

      const previousStep = steps[i - 1];

      gsap.to(previousStep, {
        scale: SCALE_DOWN,
        ease: 'none',
        scrollTrigger: {
          trigger: step,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });
    });
  });
}
