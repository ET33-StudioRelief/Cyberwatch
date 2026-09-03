import { Swiper } from '../../utils/swiper';

export function initTimelineSlider(selector = '.timeline_slider'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const scope = container.parentElement ?? container;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="timeline-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="timeline-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="timeline-pagination"]');

  new Swiper(container, {
    wrapperClass: 'timeline_track',
    slideClass: 'timeline_slide',
    slidesPerView: 'auto',
    spaceBetween: 0,
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
