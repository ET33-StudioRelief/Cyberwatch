/**
 * Height-animated open/close shared by the accordion and the FAQ dropdown.
 *
 * The `height` transition itself is declared in each component's stylesheet;
 * this module only sets the start and end heights, toggles `.is-open` on the
 * item, and keeps the trigger's ARIA state in sync.
 */
export interface Collapsible {
  /** Element that receives `.is-open`. */
  item: HTMLElement;
  /** Clickable header. Webflow renders it as a div, so it is given button semantics. */
  trigger: HTMLElement;
  /** Panel whose height is animated. */
  content: HTMLElement;
}

let idCounter = 0;

export const isOpen = ({ item }: Collapsible): boolean => item.classList.contains('is-open');

/** Runs `callback` once, when the height transition of `content` itself ends. */
function onHeightTransitionEnd(content: HTMLElement, callback: () => void): void {
  const handler = (event: TransitionEvent): void => {
    if (event.target !== content || event.propertyName !== 'height') return;
    content.removeEventListener('transitionend', handler);
    callback();
  };
  content.addEventListener('transitionend', handler);
}

/** Animates the panel from 0 to its natural height, then releases it to `auto` so it can reflow. */
export function expand(collapsible: Collapsible, onSettled?: () => void): void {
  const { item, trigger, content } = collapsible;
  item.classList.add('is-open');
  trigger.setAttribute('aria-expanded', 'true');

  requestAnimationFrame(() => {
    content.style.height = `${content.scrollHeight}px`;
  });

  onHeightTransitionEnd(content, () => {
    // The item may have been closed again before the transition ended
    if (isOpen(collapsible)) content.style.height = 'auto';
    onSettled?.();
  });
}

export function collapse(collapsible: Collapsible, onSettled?: () => void): void {
  const { item, trigger, content } = collapsible;
  trigger.setAttribute('aria-expanded', 'false');

  // `auto` cannot be transitioned: pin the current height first so there is a start value
  content.style.height = `${content.scrollHeight}px`;

  requestAnimationFrame(() => {
    content.style.height = '0px';
    item.classList.remove('is-open');
  });

  if (onSettled) onHeightTransitionEnd(content, onSettled);
}

/**
 * Gives the trigger button semantics (focusable, announced with its expanded
 * state, operable with Enter and Space) and calls `onToggle` on activation.
 * Pass `open: true` for an item that should start expanded.
 */
export function setupCollapsible(
  collapsible: Collapsible,
  onToggle: () => void,
  open = false
): void {
  const { item, trigger, content } = collapsible;

  if (!content.id) content.id = `collapsible-${(idCounter += 1)}`;
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-controls', content.id);
  trigger.setAttribute('aria-expanded', String(open));
  trigger.tabIndex = 0;

  if (open) {
    content.style.height = 'auto';
    item.classList.add('is-open');
  }

  trigger.addEventListener('click', onToggle);
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault(); // Space would otherwise scroll the page
    onToggle();
  });
}
