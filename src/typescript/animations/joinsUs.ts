import { gsap } from '../../utils/gsap';

interface JoinsUsFloatConfig {
  /** Travel distance in % of the image height, each side of rest. */
  amount: number;
  /** ScrollTrigger scrub value (higher = more lag/smoothing). */
  speed: number;
  /** Flip the direction so it drifts out of sync with the other images. */
  invert?: boolean;
}

/** Per-image tuning so the collage floats as independent layers instead of one flat block. */
const JOINS_US_FLOAT_CONFIG: Record<string, JoinsUsFloatConfig> = {
  '.joins-us_left-img-wrp': { amount: 6, speed: 1.2 },
  '.joins-us_top-left-img-wrp': { amount: 8, speed: 1.6, invert: true },
  '.joins-us_top-right-img-wrp': { amount: 5, speed: 1.3 },
  '.join-us_btm-right-img-wrp': { amount: 7, speed: 1.5, invert: true },
};

/**
 * Makes each image in the "joins us" collage drift up/down at its own pace as
 * the section scrolls, so the images read as independent floating layers
 * rather than a single flat block.
 *
 * @param selector - CSS selector targeting the collage wrapper.
 */
export function initJoinsUsFloat(selector = '.joins-us_img-layout'): void {
  const wrap = document.querySelector<HTMLElement>(selector);
  if (!wrap) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    Object.entries(JOINS_US_FLOAT_CONFIG).forEach(([imgSelector, { amount, speed, invert }]) => {
      const img = wrap.querySelector<HTMLElement>(`${imgSelector} img`);
      if (!img) return;

      const from = invert ? amount : -amount;
      const to = invert ? -amount : amount;

      gsap.fromTo(
        img,
        { yPercent: from },
        {
          yPercent: to,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: speed,
          },
        }
      );
    });
  });
}
