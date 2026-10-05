import { createSlider, promoteSlides } from '../../utils/swiper';

/**
 * "D'autres articles" related-posts slider on the Blog Post CMS template page.
 * The slides come from a CMS Collection List (see `promoteSlides`), and the
 * controls sit next to the list, in `.slider-blog-related_content`.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initBlogRelatedSlider(selector = '.slider-blog-related_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  promoteSlides(container.querySelector('.swiper-wrapper'), '.w-dyn-item');

  const scope = container.closest('.slider-blog-related_content') ?? document;
  createSlider(container, 'blog-related', scope);
}
