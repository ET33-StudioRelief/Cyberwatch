import { createSlider } from '../../utils/swiper';

/**
 * Customer cases slider. Unlike the other sliders, its controls are placed
 * inside the container itself.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initCasesSlider(selector = '.features-slider_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  createSlider(container, 'cases', container);
}
