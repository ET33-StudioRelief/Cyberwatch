import { gsap, ScrollTrigger } from '../../utils/gsap';

/** Facteur de réduction appliqué à l'étape précédente une fois recouverte. */
const SCALE_DOWN = 0.92;
/** Scale down plus prononcé pour la dernière step (recouverte par ce qui suit le wrapper). */
const SCALE_DOWN_LAST = 0.1;
/** Délai (en px de scroll) après lequel une step recouverte est effectivement masquée. */
const HIDE_DELAY = 150;

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
    // Masque définitivement une step une fois recouverte, avec un délai
    // après que la suivante ait atteint sa position épinglée (top top) :
    // sans ce délai, le masquage se déclenche pile quand la suivante arrive
    // tout juste, avant qu'elle ne recouvre visuellement tout l'écran.
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

    // La dernière step n'a pas de step suivante dans `steps` pour la
    // recouvrir : si un élément la suit directement dans le wrapper (ex.
    // section_perimetre), on la scale down/fade de la même façon, en
    // utilisant cet élément comme trigger. `transformOrigin: 'top'` évite
    // qu'une step très haute (donc avec un centre de scale très bas, hors
    // écran) ne voie son sommet redescendre visuellement lors du scale.
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
