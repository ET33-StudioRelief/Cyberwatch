import { TABLET_QUERY } from '../../utils/breakpoint';
import { gsap, ScrollTrigger } from '../../utils/gsap';

/** Matches the `.navbar_menu` desktop breakpoint set in navbar.css. */
const NAV_MENU_DESKTOP_QUERY = '(min-width: 1350px)';
const SCROLL_LOCK_CLASS = 'nav-scroll-lock';
const DROPDOWN_VIEWPORT_MARGIN = 16;
/** Dropdown lists carrying this class get anchored to their toggle via JS instead of Webflow's default full-width positioning (see positionDropdownList). */
const ANCHORED_DROPDOWN_LIST_CLASS = 'nav_dropdown-list';

const SCROLL_THRESHOLD = 5;
const SCROLL_DELTA = 5;
const SCROLLED_THRESHOLD = 80;

const positionDropdownList = (toggle: HTMLElement, list: HTMLElement): void => {
  const toggleRect = toggle.getBoundingClientRect();
  list.style.position = 'fixed';
  list.style.top = `${toggleRect.bottom}px`;
  list.style.right = 'auto';
  list.style.minWidth = '0';

  const toggleCenter = toggleRect.left + toggleRect.width / 2;
  const listWidth = list.getBoundingClientRect().width;
  const minLeft = DROPDOWN_VIEWPORT_MARGIN;
  const maxLeft = window.innerWidth - DROPDOWN_VIEWPORT_MARGIN - listWidth;
  const centeredLeft = toggleCenter - listWidth / 2;

  list.style.left = `${Math.min(Math.max(centeredLeft, minLeft), maxLeft)}px`;
};

const resetDropdownListPosition = (list: HTMLElement): void => {
  list.style.position = '';
  list.style.top = '';
  list.style.left = '';
  list.style.right = '';
  list.style.minWidth = '';
};

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

    const isListAnchored = list.classList.contains(ANCHORED_DROPDOWN_LIST_CLASS);

    const setOpen = (open: boolean): void => {
      toggle.classList.toggle('w--open', open);
      list.classList.toggle('w--open', open);
      if (!isListAnchored) return;
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
