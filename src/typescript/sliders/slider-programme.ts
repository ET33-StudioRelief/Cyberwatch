import { createSlider, promoteSlides } from '../../utils/swiper';

/**
 * Programme (course syllabus) card slider, three cards per view. Each card sits
 * in a `.card-slot` component slot (see `promoteSlides`).
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initProgrammeSlider(selector = '.programme_list-cards-wrp'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  promoteSlides(container.querySelector('.programme_list-cards'), '.card-slot');

  createSlider(container, 'programme', container.parentElement ?? container, {
    slidesPerView: 3,
  });
}
