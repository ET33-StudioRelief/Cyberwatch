import { Swiper } from '../../utils/swiper';

/** Below this width the steps become a Swiper; above it Webflow/CSS handles the grid layout. */
const BREAKPOINT_QUERY = '(max-width: 1350px)';

/**
 * Steps slider, active only below 1300px. Swiper is created and torn down as
 * the viewport crosses the breakpoint (window resize, device rotation).
 *
 * @param selector - CSS selector targeting the Swiper container.
 */
export function initHpStepsSlider(selector = '.hp-steps_layout'): void {
  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return;

  const scope = container.parentElement ?? container;
  const prevEl = scope.querySelector<HTMLElement>('[trigger="hp-steps-prev-slide"]');
  const nextEl = scope.querySelector<HTMLElement>('[trigger="hp-steps-next-slide"]');
  const paginationEl = scope.querySelector<HTMLElement>('[trigger="hp-steps-pagination"]');

  const mql = window.matchMedia(BREAKPOINT_QUERY);
  let instance: InstanceType<typeof Swiper> | null = null;

  const sync = (): void => {
    if (mql.matches && !instance) {
      instance = new Swiper(container, {
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
    } else if (!mql.matches && instance) {
      instance.destroy(true, true);
      instance = null;
    }
  };

  sync();
  mql.addEventListener('change', sync);
}
