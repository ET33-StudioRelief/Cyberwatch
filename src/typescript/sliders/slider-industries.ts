import { Swiper } from '../../utils/swiper';

/**
 * Industries card slider on the homepage. Navigation and pagination use custom
 * Webflow elements (`[trigger]` attributes) instead of Swiper-generated markup.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initIndustriesSlider(selector = '.hp-industries_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const prevEl = container.querySelector<HTMLElement>('[trigger="industries-prev-slide"]');
  const nextEl = container.querySelector<HTMLElement>('[trigger="industries-next-slide"]');
  const paginationEl = container.querySelector<HTMLElement>('[trigger="industries-pagination"]');

  new Swiper(container, {
    slidesPerView: 'auto',
    spaceBetween: 40,
    rewind: true,
    grabCursor: true,
    navigation: {
      prevEl,
      nextEl,
    },
    pagination: {
      el: paginationEl,
      clickable: true,
    },
  });
}
