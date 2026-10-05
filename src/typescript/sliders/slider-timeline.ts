import { createSlider } from '../../utils/swiper';

/**
 * Company timeline slider. Uses its own Webflow classes (`.timeline_track`,
 * `.timeline_slide`) instead of `.swiper-wrapper` / `.swiper-slide`, with no
 * gap so the timeline line runs continuously across slides.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initTimelineSlider(selector = '.timeline_slider'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  createSlider(container, 'timeline', container.parentElement ?? container, {
    wrapperClass: 'timeline_track',
    slideClass: 'timeline_slide',
    spaceBetween: 0,
  });
}
