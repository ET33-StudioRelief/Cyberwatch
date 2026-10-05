import { createSlider } from '../../utils/swiper';

/**
 * Testimonial slider with a centred active slide; the inactive slides are
 * scaled down and blurred in slider.css. Starts on the second slide when there
 * are more than two, so the first view shows a slide on each side.
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initTestimonialSlider(selector = '.testimonial_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const slidesCount = container.querySelectorAll('.swiper-wrapper > .swiper-slide').length;

  createSlider(container, 'testimonial', container.parentElement ?? container, {
    centeredSlides: true,
    initialSlide: slidesCount <= 2 ? 0 : 1,
    speed: 600,
  });
}
