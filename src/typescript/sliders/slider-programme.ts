import { Swiper } from '../../utils/swiper';

/**
 * Programme (course syllabus) card slider. Each slide is wrapped in a
 * `.card-slot` div (Webflow component slot) that sits between the
 * swiper-wrapper and the actual slide markup. Swiper only recognises
 * `.swiper-slide` elements that are DIRECT children of the wrapper, so we
 * promote the `swiper-slide` class onto each non-empty slot.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initProgrammeSlider(selector = '.programme_list-cards-wrp'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const wrapper = container.querySelector<HTMLElement>('.programme_list-cards');
  wrapper?.querySelectorAll<HTMLElement>(':scope > .card-slot').forEach((slot) => {
    const slide = slot.querySelector<HTMLElement>('.swiper-slide');
    if (!slide) return;
    slot.classList.add('swiper-slide');
    slide.classList.remove('swiper-slide');
  });

  const scope = container.parentElement ?? container;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="programme-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="programme-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="programme-pagination"]');

  new Swiper(container, {
    slidesPerView: 3,
    spaceBetween: 24,
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
