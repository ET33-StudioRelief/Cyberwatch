import { gsap } from '../../utils/gsap';

/** Facteur de réduction appliqué à l'étape précédente une fois recouverte. */
const SCALE_DOWN = 0.92;

/**
 * Effet de profondeur pour des sections sticky empilées : tous les
 * `.section_step` sont enfants d'un même `.section-wrapper` et empilés en
 * flux normal (chacun avec sa propre hauteur, ex. 100vh), chacun étant
 * `position: sticky; top: 0`. Quand une étape défile, elle reste collée en
 * haut le temps de traverser sa propre bande de hauteur, puis l'étape
 * suivante — placée après elle dans le DOM, donc au-dessus visuellement —
 * arrive depuis le bas et vient la recouvrir. On profite de cette fenêtre
 * de défilement pour réduire légèrement l'échelle de l'étape précédente,
 * donnant l'impression qu'elle recule derrière celle qui arrive.
 *
 * La plage de scroll utilisée pour chaque transition correspond exactement
 * à la distance parcourue par une étape entre son entrée en bas du viewport
 * et son alignement en haut (moment où elle devient sticky) — soit la même
 * fenêtre pendant laquelle elle recouvre visuellement l'étape précédente.
 *
 * @param wrapperSelector - Sélecteur CSS du conteneur unique.
 * @param stepSelector - Sélecteur CSS des étapes sticky, enfants du conteneur.
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
    steps.forEach((step, i) => {
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
