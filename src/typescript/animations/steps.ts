import { gsap } from '../../utils/gsap';

/** Amplitude du flottement (en % de la hauteur du badge) de chaque côté du repos. */
const LEGEND_FLOAT_AMOUNT = 12;

/** Vitesse de scrub du flottement du badge (plus haut = plus de retard/lissage). */
const LEGEND_FLOAT_SPEED = 1.4;

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

/**
 * Makes each `.step_legend-wrp` badge drift up and down at a slower/faster
 * pace than the page scroll, giving it a floating feel as its step scrolls
 * through the viewport.
 *
 * @param selector - CSS selector targeting each legend badge.
 */
export function initStepLegendFloat(selector = '.step_legend-wrp'): void {
  const legends = gsap.utils.toArray<HTMLElement>(selector);
  if (legends.length === 0) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    legends.forEach((legend) => {
      const wrap = legend.closest<HTMLElement>('.step_img-wrp') ?? legend.parentElement;
      if (!wrap) return;

      gsap.fromTo(
        legend,
        { yPercent: -LEGEND_FLOAT_AMOUNT },
        {
          yPercent: LEGEND_FLOAT_AMOUNT,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: LEGEND_FLOAT_SPEED,
          },
        }
      );
    });
  });
}
