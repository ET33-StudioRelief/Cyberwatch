import {
  collapse,
  type Collapsible,
  expand,
  isOpen,
  setupCollapsible,
} from '../../utils/collapsible';
import { ScrollTrigger } from '../../utils/gsap';

const ACCORDION_SELECTOR = '.accordion-component';
const ACCORDION_TRIGGER = '.accordion_show-content';
const ACCORDION_CONTENT = '.accordion_hide-content';
const ACCORDION_DEFAULT_ATTRIBUTE = 'data-accordion-default';

/**
 * Opening or closing an accordion changes the page height, which shifts every
 * ScrollTrigger start/end point further down the page. `ScrollTrigger.refresh()`
 * recomputes those points, but since the user's scroll position has not moved,
 * the animations below would visibly jump. To prevent it, the scroll position
 * is shifted by the same delta as the height change, so nothing moves on screen.
 *
 * Exception: inside a stacked `.section_step` (see stackedSections.ts), the
 * growing step drives its own reveal ScrollTrigger relative to its own height
 * (start = its top, end = its top + its overflow). That trigger did not shift,
 * so compensating the scroll would artificially advance its progress on every
 * opened accordion, translating the step too far up and revealing the previous
 * one. The scroll position is left untouched for those steps.
 */
function refreshScrollTriggers(heightBefore: number, item: HTMLElement): void {
  if (!item.closest('.section_step')) {
    const delta = document.documentElement.scrollHeight - heightBefore;
    if (delta !== 0) {
      window.scrollTo({ top: window.scrollY + delta, left: window.scrollX });
    }
  }
  ScrollTrigger.refresh();
}

/**
 * Accordion for `.accordion-component` items. Each item opens/closes
 * independently — no sibling collapsing.
 *
 * Set `data-accordion-default="open"` on `.accordion-component` in Webflow
 * to have that item expanded on load.
 */
export function initAccordion(): void {
  const accordions = document.querySelectorAll<HTMLElement>(ACCORDION_SELECTOR);
  if (!accordions.length) return;

  accordions.forEach((item) => {
    const trigger = item.querySelector<HTMLElement>(ACCORDION_TRIGGER);
    const content = item.querySelector<HTMLElement>(ACCORDION_CONTENT);
    if (!trigger || !content) return;

    const collapsible: Collapsible = { item, trigger, content };

    const toggle = (): void => {
      const heightBefore = document.documentElement.scrollHeight;
      const onSettled = () => refreshScrollTriggers(heightBefore, item);
      if (isOpen(collapsible)) collapse(collapsible, onSettled);
      else expand(collapsible, onSettled);
    };

    setupCollapsible(
      collapsible,
      toggle,
      item.getAttribute(ACCORDION_DEFAULT_ATTRIBUTE) === 'open'
    );
  });
}
