import { createSlider, promoteSlides } from '../../utils/swiper';

/**
 * Industries card slider on the homepage. The slides come from a CMS
 * Collection List (see `promoteSlides`), and the controls live in
 * `.slider_nav`, a sibling of the list inside `.slider-industries_content`.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initIndustriesSlider(selector = '.slider-industries_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  promoteSlides(container.querySelector('.swiper-wrapper'), '.w-dyn-item');

  const scope = container.closest('.slider-industries_content') ?? document;
  createSlider(container, 'industries', scope, { spaceBetween: 40 });
}
