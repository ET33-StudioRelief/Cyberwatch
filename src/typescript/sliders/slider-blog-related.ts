import { Swiper } from '../../utils/swiper';

/**
 * "D'autres articles" related-posts slider on the Blog Post CMS template page.
 * Same pattern as the industries slider: Webflow CMS (`w-dyn-list`) inserts a
 * `.w-dyn-item` level between the swiper-wrapper and the actual slide markup,
 * so we promote it to `.swiper-slide` since Swiper only recognises direct
 * children of the wrapper as slides.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initBlogRelatedSlider(selector = '.slider-blog-related_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const wrapper = container.querySelector<HTMLElement>('.swiper-wrapper');
  wrapper?.querySelectorAll<HTMLElement>(':scope > .w-dyn-item').forEach((item) => {
    item.classList.add('swiper-slide');
    item.querySelector('.swiper-slide:not(.w-dyn-item)')?.classList.remove('swiper-slide');
  });

  const scope = container.closest<HTMLElement>('.slider-blog-related_content') ?? document;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="blog-related-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="blog-related-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="blog-related-pagination"]');

  new Swiper(container, {
    slidesPerView: 'auto',
    spaceBetween: 24,
    rewind: true,
    grabCursor: true,
    navigation: { prevEl, nextEl },
    pagination: { el: paginationEl, clickable: true },
  });
}
