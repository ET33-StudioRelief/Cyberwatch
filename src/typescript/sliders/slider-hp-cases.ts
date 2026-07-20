import { Swiper } from '../../utils/swiper';

export function initHpCasesSlider(selector = '.hp-cases_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const prevEl = container.querySelector<HTMLElement>('[trigger="cases-prev-slide"]');
  const nextEl = container.querySelector<HTMLElement>('[trigger="cases-next-slide"]');
  const paginationEl = container.querySelector<HTMLElement>('[trigger="cases-pagination"]');

  new Swiper(container, {
    slidesPerView: 'auto',
    spaceBetween: 24,
    rewind: true,
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
