const openAccordion = (container: HTMLElement, contentSelector: string): void => {
  const content = container.querySelector<HTMLElement>(contentSelector);
  if (!content) return;

  container.classList.add('is-open');

  requestAnimationFrame(() => {
    content.style.height = `${content.scrollHeight}px`;
  });

  const onTransitionEnd = (event: TransitionEvent): void => {
    if (event.propertyName !== 'height') return;
    if (container.classList.contains('is-open')) {
      content.style.height = 'auto';
    }
    content.removeEventListener('transitionend', onTransitionEnd);
  };

  content.addEventListener('transitionend', onTransitionEnd);
};

const closeAccordion = (container: HTMLElement, contentSelector: string): void => {
  const content = container.querySelector<HTMLElement>(contentSelector);
  if (!content) return;

  content.style.height = `${content.scrollHeight}px`;

  requestAnimationFrame(() => {
    content.style.height = '0px';
    container.classList.remove('is-open');
  });
};

const toggleAccordion = (container: HTMLElement, contentSelector: string): void => {
  if (container.classList.contains('is-open')) {
    closeAccordion(container, contentSelector);
    return;
  }

  openAccordion(container, contentSelector);
};

const ACCORDION_SELECTOR = '.accordion-component';
const ACCORDION_TRIGGER = '.accordion_show-content';
const ACCORDION_CONTENT = '.accordion_hide-content';
const ACCORDION_DEFAULT_ATTRIBUTE = 'data-accordion-default';

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

  accordions.forEach((accordion) => {
    const trigger = accordion.querySelector<HTMLElement>(ACCORDION_TRIGGER);
    if (!trigger) return;

    if (accordion.getAttribute(ACCORDION_DEFAULT_ATTRIBUTE) === 'open') {
      const content = accordion.querySelector<HTMLElement>(ACCORDION_CONTENT);
      if (content) content.style.height = 'auto';
      accordion.classList.add('is-open');
    }

    trigger.addEventListener('click', () => toggleAccordion(accordion, ACCORDION_CONTENT));
  });
}
