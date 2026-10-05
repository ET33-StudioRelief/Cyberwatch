import { NAV_MOBILE_QUERY } from '../../utils/breakpoint';
import { createSlider, type Swiper } from '../../utils/swiper';

/**
 * Homepage steps slider, active only below 1350px; above it, Webflow/CSS lays
 * the steps out as a grid. Swiper is created and torn down as the viewport
 * crosses the breakpoint (window resize, device rotation).
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initHpStepsSlider(selector = '.hp-steps_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const scope = container.parentElement ?? container;
  const mql = window.matchMedia(NAV_MOBILE_QUERY);
  let instance: Swiper | null = null;

  const sync = (): void => {
    if (mql.matches && !instance) {
      instance = createSlider(container, 'hp-steps', scope);
    } else if (!mql.matches && instance) {
      instance.destroy(true, true);
      instance = null;
    }
  };

  sync();
  mql.addEventListener('change', sync);
}
