import { gsap, ScrollTrigger } from '../../utils/gsap';

/** Scale applied to the previous step while the next one slides over it. */
const SCALE_DOWN = 0.92;
/** Stronger scale-down for the last step, covered by whatever follows it in the wrapper. */
const SCALE_DOWN_LAST = 0.1;
/** Scroll distance (px) after which a covered step is actually hidden. */
const HIDE_DELAY = 150;

/**
 * Stacked-card scroll effect: each `.section_step` scrolls up over the previous
 * one, which scales down and is hidden once fully covered. A step taller than
 * the viewport first scrolls through its own overflow before the next one
 * starts covering it.
 *
 * @param wrapperSelector - CSS selector targeting the wrapper of the steps.
 * @param stepSelector - CSS selector targeting each step, inside the wrapper.
 */
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
    // Hides a step once it is covered, HIDE_DELAY px after the next one reaches
    // its pinned position (top top). Without the delay, the step would be hidden
    // the moment the next one arrives, before it visually covers the screen.
    const hideBehind = (hiddenStep: HTMLElement, coveringTrigger: HTMLElement): void => {
      ScrollTrigger.create({
        trigger: coveringTrigger,
        start: `top+=${HIDE_DELAY} top`,
        onEnter: () => gsap.set(hiddenStep, { autoAlpha: 0 }),
        onLeaveBack: () => gsap.set(hiddenStep, { autoAlpha: 1 }),
      });
    };

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

      hideBehind(previousStep, step);
    });

    // The last step has no following step to cover it. If an element directly
    // follows it in the wrapper (e.g. section_perimetre), it is scaled down and
    // faded the same way, using that element as the trigger. `transformOrigin:
    // 'top'` keeps a very tall step (whose scale centre is far below, off
    // screen) from visibly sliding its top edge down while it shrinks.
    const lastStep = steps[steps.length - 1];
    const afterLastStep = lastStep.nextElementSibling as HTMLElement | null;

    if (afterLastStep) {
      gsap.to(lastStep, {
        scale: SCALE_DOWN_LAST,
        opacity: 0,
        transformOrigin: 'top',
        ease: 'none',
        scrollTrigger: {
          trigger: afterLastStep,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });

      hideBehind(lastStep, afterLastStep);
    }
  });
}
