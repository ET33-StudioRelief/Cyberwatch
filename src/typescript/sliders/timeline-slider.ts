import { Swiper } from '../../utils/swiper';

/**
 * "Notre histoire" timeline slider on the About page. Uses `.timeline_track` /
 * `.timeline_item` directly as Swiper's wrapper/slide classes (via
 * `wrapperClass`/`slideClass`) instead of the usual `swiper-wrapper` /
 * `swiper-slide` classes, since those names collide with unrelated combo
 * classes already registered on other components in this Webflow site.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initTimelineSlider(selector = '.timeline_slider'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const scope = container.parentElement ?? container;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="timeline-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="timeline-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="timeline-pagination"]');

  new Swiper(container, {
    wrapperClass: 'timeline_track',
    slideClass: 'timeline_item',
    slidesPerView: 'auto',
    spaceBetween: 48,
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
