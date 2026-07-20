import { TABLET_QUERY } from '../../utils/breakpoint';
import { gsap, ScrollTrigger } from '../../utils/gsap';

/** Matches the `.navbar_menu` desktop breakpoint set in navbar.css. */
const NAV_MENU_DESKTOP_QUERY = '(min-width: 1350px)';
const SCROLL_LOCK_CLASS = 'nav-scroll-lock';
const DROPDOWN_VIEWPORT_MARGIN = 16;
/** Toggles carrying this class get their dropdown list anchored to them via JS instead of Webflow's default full-width positioning (see positionDropdownList). */
const TOGGLE_ANCHORED_DROPDOWN_CLASS = 'is-wip';

const SCROLL_THRESHOLD = 5;
const SCROLL_DELTA = 5;
const SCROLLED_THRESHOLD = 80;

// Disabled: closing open dropdowns before the navbar slides out on scroll down.
// Not needed for this project — kept here in case it's wanted later.
// const OPEN_TOGGLE_SELECTOR = '.w-dropdown-toggle.w--open';
// const OPEN_LIST_SELECTOR = '.w-dropdown-list.w--open';
// const DEFAULT_DROPDOWN_DURATION = 400;
//
// type WebflowJQueryWrapper = {
//   trigger(event: string): void;
// };
//
// type WebflowJQuery = (element: HTMLElement) => WebflowJQueryWrapper;
//
// const wait = (ms: number): Promise<void> =>
//   new Promise((resolve) => {
//     window.setTimeout(resolve, ms);
//   });
//
// /** Webflow-native close — keeps internal dropdown state in sync (avoids double-click). */
// const closeDropdownViaWebflow = (toggle: HTMLElement): Promise<void> => {
//   const dropdown = toggle.closest<HTMLElement>('.w-dropdown');
//   if (!dropdown) return Promise.resolve();
//
//   const { jQuery } = window as Window & { jQuery?: WebflowJQuery };
//
//   if (jQuery) {
//     jQuery(dropdown).trigger('w-close.w-dropdown');
//     return Promise.resolve();
//   }
//
//   toggle.dispatchEvent(
//     new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window })
//   );
//   toggle.dispatchEvent(
//     new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window })
//   );
//   return Promise.resolve();
// };

/**
 * Anchors a dropdown list directly under its own toggle via fixed positioning,
 * instead of Webflow's default absolute positioning (which resolves against
 * whatever ancestor is positioned — here `.navbar`, spanning the full width).
 * Also overrides Webflow's default `min-width: 100%` on `.w-dropdown-list`: once
 * `position: fixed`, that percentage resolves against `.navbar` (the containing
 * block created by its `will-change: transform`), not the small toggle wrapper,
 * so it silently stretches the list back to full viewport width.
 * Nudges it back within the viewport if it would overflow the right edge.
 */
const positionDropdownList = (toggle: HTMLElement, list: HTMLElement): void => {
  const toggleRect = toggle.getBoundingClientRect();
  list.style.position = 'fixed';
  list.style.top = `${toggleRect.bottom}px`;
  list.style.left = `${toggleRect.left}px`;
  list.style.right = 'auto';
  list.style.minWidth = '0';

  const overflowRight =
    list.getBoundingClientRect().right - (window.innerWidth - DROPDOWN_VIEWPORT_MARGIN);
  if (overflowRight > 0) {
    list.style.left = `${toggleRect.left - overflowRight}px`;
  }
};

const resetDropdownListPosition = (list: HTMLElement): void => {
  list.style.position = '';
  list.style.top = '';
  list.style.left = '';
  list.style.right = '';
  list.style.minWidth = '';
};

// /** Webflow-native close — keeps internal dropdown state in sync (avoids double-click). */
// const closeDropdownViaWebflow = (toggle: HTMLElement): Promise<void> => {
//   const dropdown = toggle.closest<HTMLElement>('.w-dropdown');
//   if (!dropdown) return Promise.resolve();
//
//   const { jQuery } = window as Window & { jQuery?: WebflowJQuery };
//
//   if (jQuery) {
//     jQuery(dropdown).trigger('w-close.w-dropdown');
//     return Promise.resolve();
//   }
//
//   toggle.dispatchEvent(
//     new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window })
//   );
//   toggle.dispatchEvent(
//     new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window })
//   );
//   return Promise.resolve();
// };

/**
 * Hides the navbar on scroll down (slide up) and reveals it on scroll up (slide down).
 * Toggles `.scrolled` for a readable background past the hero (see navbar.css).
 *
 * @param selector - CSS selector targeting the navbar wrapper.
 */
export function initNavbar(selector = '[trigger="navbar"]'): void {
  const navbar = document.querySelector<HTMLElement>(selector);
  if (!navbar) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let isHidden = false;
  let lastScrollY = window.scrollY;

  gsap.set(navbar, { yPercent: 0 });

  const yTo = gsap.quickTo(navbar, 'yPercent', {
    duration: 0.3,
    ease: 'easeInOut',
    overwrite: 'auto',
  });

  const updateScrolled = (scrollY: number): void => {
    navbar.classList.toggle('scrolled', scrollY > SCROLLED_THRESHOLD);
  };

  // Disabled: closing open dropdowns before the navbar slides out on scroll down.
  // Not needed for this project — kept here in case it's wanted later.
  // const getOpenDropdownToggles = (): HTMLElement[] => {
  //   const toggles = [...navbar.querySelectorAll<HTMLElement>(OPEN_TOGGLE_SELECTOR)];
  //   if (toggles.length) return toggles;
  //
  //   return [...navbar.querySelectorAll<HTMLElement>(OPEN_LIST_SELECTOR)]
  //     .map(
  //       (list) =>
  //         list.closest('.w-dropdown')?.querySelector<HTMLElement>('.w-dropdown-toggle') ?? null
  //     )
  //     .filter((toggle): toggle is HTMLElement => toggle !== null);
  // };
  //
  // const closeOpenDropdowns = async (toggles: HTMLElement[]): Promise<void> => {
  //   await Promise.all(toggles.map(closeDropdownViaWebflow));
  //   await wait(dropdownCloseDurationMs);
  // };
  //
  // const cancelPendingHide = (): void => {
  //   if (pendingHide) {
  //     pendingHide.cancelled = true;
  //     pendingHide = null;
  //   }
  //   isClosingDropdowns = false;
  // };

  const slideNavbarOut = (): void => {
    isHidden = true;
    yTo(-100);
  };

  const show = (): void => {
    if (!isHidden) return;
    isHidden = false;
    yTo(0);
  };

  const hide = (): void => {
    if (isHidden) return;
    slideNavbarOut();
  };

  updateScrolled(window.scrollY);

  window.matchMedia(TABLET_QUERY).addEventListener('change', () => {
    ScrollTrigger.refresh();
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const scrollY = self.scroll();
      const delta = scrollY - lastScrollY;

      updateScrolled(scrollY);

      if (navbar.classList.contains('w--open') || scrollY <= SCROLL_THRESHOLD) {
        show();
        lastScrollY = scrollY;
        return;
      }

      if (delta > SCROLL_DELTA) hide();
      else if (delta < -SCROLL_DELTA) show();

      lastScrollY = scrollY;
    },
  });
}

/**
 * Mobile/tablet nav menu (< 1350px): toggles `.navbar_menu.is-open` and locks
 * page scroll while open so a scroll gesture stays inside the menu instead of
 * scrolling the page behind it (`.navbar_menu` handles its own overflow, see navbar.css).
 * Closes on outside click, Escape, or crossing back into the desktop breakpoint.
 *
 * @param selector - CSS selector targeting the nav wrapper.
 */
export function initNavMenu(selector = '[data-nav]'): void {
  const nav = document.querySelector<HTMLElement>(selector);
  if (!nav) return;

  const menu = nav.querySelector<HTMLElement>('[data-nav-menu]');
  const toggle = nav.querySelector<HTMLElement>('[data-nav-toggle]');
  if (!menu || !toggle) return;

  const desktop = window.matchMedia(NAV_MENU_DESKTOP_QUERY);

  /**
   * Fills the viewport space below the menu's top edge, so it looks full-screen even
   * with little content, and scrolls internally instead of the page when content is taller.
   */
  const updateMenuHeight = (): void => {
    menu.style.height = `${window.innerHeight - menu.getBoundingClientRect().top}px`;
  };

  const setOpen = (open: boolean): void => {
    if (open) updateMenuHeight();
    else menu.style.height = '';
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle(SCROLL_LOCK_CLASS, open);
  };

  toggle.addEventListener('click', () => {
    setOpen(!menu.classList.contains('is-open'));
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target as Node)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (menu.classList.contains('is-open')) updateMenuHeight();
  });
}

/**
 * Opens Webflow dropdowns on hover, but only at desktop width (≥ 1350px, same
 * breakpoint as `.navbar_menu`). Below that, dropdowns keep Webflow's default
 * click-to-open behavior — set the dropdown's Designer interaction back to
 * "Click" so it doesn't also fire its own (breakpoint-unaware) hover handler.
 *
 * @param selector - CSS selector targeting the navbar wrapper.
 */
export function initDesktopDropdownHover(selector = '[trigger="navbar"]'): void {
  const navbar = document.querySelector<HTMLElement>(selector);
  if (!navbar) return;

  const desktop = window.matchMedia(NAV_MENU_DESKTOP_QUERY);

  navbar.querySelectorAll<HTMLElement>('.w-dropdown').forEach((dropdown) => {
    const toggle = dropdown.querySelector<HTMLElement>('.w-dropdown-toggle');
    const list = dropdown.querySelector<HTMLElement>('.w-dropdown-list');
    if (!toggle || !list) return;

    const isToggleAnchored = toggle.classList.contains(TOGGLE_ANCHORED_DROPDOWN_CLASS);

    const setOpen = (open: boolean): void => {
      toggle.classList.toggle('w--open', open);
      list.classList.toggle('w--open', open);
      if (!isToggleAnchored) return;
      if (open) positionDropdownList(toggle, list);
      else resetDropdownListPosition(list);
    };

    dropdown.addEventListener('mouseenter', () => {
      if (desktop.matches) setOpen(true);
    });

    dropdown.addEventListener('mouseleave', () => {
      if (desktop.matches) setOpen(false);
    });
  });
}
