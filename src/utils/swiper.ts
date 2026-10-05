import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import type { SwiperOptions } from 'swiper/types';

// Central place to enable Swiper modules. CSS is intentionally not imported:
// navigation/pagination elements are custom Webflow markup styled by project CSS.
Swiper.use([Navigation, Pagination]);

export { Swiper };

/** Defaults shared by every slider of the site; each slider overrides what it needs. */
const DEFAULT_OPTIONS: SwiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 24,
  rewind: true,
  grabCursor: true,
};

/**
 * Swiper only treats DIRECT children of the wrapper as slides. Webflow inserts an
 * extra level in between: `.w-dyn-item` for a CMS Collection List, `.card-slot` for a
 * component slot. This moves the `swiper-slide` class up onto those intermediate
 * elements. Empty slots are skipped, since the critical CSS hides them.
 *
 * @param wrapper - The `.swiper-wrapper` element (or the custom wrapper class).
 * @param childSelector - The intermediate elements to promote, e.g. `.w-dyn-item`.
 */
export function promoteSlides(wrapper: HTMLElement | null, childSelector: string): void {
  wrapper?.querySelectorAll<HTMLElement>(`:scope > ${childSelector}`).forEach((child) => {
    if (!child.firstElementChild) return;
    child.classList.add('swiper-slide');
    child.querySelector(':scope .swiper-slide')?.classList.remove('swiper-slide');
  });
}

/**
 * Creates a Swiper wired to custom Webflow controls. The controls are found in
 * `scope` by their `trigger` attribute: `<name>-prev-slide`, `<name>-next-slide`
 * and `<name>-pagination`. Any of them may be missing.
 *
 * @param container - The Swiper container.
 * @param name - Prefix of the controls' `trigger` attributes, e.g. `industries`.
 * @param scope - Element the controls live in (usually a parent of the container).
 * @param options - Swiper options merged over the site defaults.
 */
export function createSlider(
  container: HTMLElement,
  name: string,
  scope: ParentNode,
  options: SwiperOptions = {}
): Swiper {
  const control = (suffix: string) =>
    scope.querySelector<HTMLElement>(`[trigger="${name}-${suffix}"]`);

  return new Swiper(container, {
    ...DEFAULT_OPTIONS,
    ...options,
    navigation: { prevEl: control('prev-slide'), nextEl: control('next-slide') },
    pagination: { el: control('pagination'), clickable: true },
  });
}
