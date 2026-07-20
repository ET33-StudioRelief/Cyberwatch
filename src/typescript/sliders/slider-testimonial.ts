import { Swiper } from '../../utils/swiper';

export function initTestimonialSlider(selector = '.testimonial_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const scope = container.parentElement ?? container;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="testimonial-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="testimonial-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="testimonial-pagination"]');

  new Swiper(container, {
    slidesPerView: 'auto',
    centeredSlides: true,
    initialSlide: 1,
    spaceBetween: 24,
    rewind: true,
    speed: 600,
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
