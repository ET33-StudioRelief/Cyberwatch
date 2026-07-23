import { Swiper } from '../../utils/swiper';

/**
 * Industries card slider on the homepage. Navigation and pagination use custom
 * Webflow elements (`[trigger]` attributes) instead of Swiper-generated markup.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initIndustriesSlider(selector = '.slider-industries_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  // Webflow CMS (`w-dyn-list`) inserts a `.w-dyn-item` level between the
  // swiper-wrapper and the actual slide markup. Swiper only recognises
  // `.swiper-slide` elements that are DIRECT children of the wrapper, so we
  // promote the `swiper-slide` class onto each collection item.
  const wrapper = container.querySelector<HTMLElement>('.swiper-wrapper');
  wrapper?.querySelectorAll<HTMLElement>(':scope > .w-dyn-item').forEach((item) => {
    item.classList.add('swiper-slide');
    item.querySelector('.swiper-slide:not(.w-dyn-item)')?.classList.remove('swiper-slide');
  });

  // Navigation & pagination live in `.slider_nav`, which is a sibling of the
  // collection list, so we search from a shared ancestor instead of `container`.
  const scope = container.closest<HTMLElement>('.slider-industries_content') ?? document;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="industries-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="industries-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="industries-pagination"]');

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
