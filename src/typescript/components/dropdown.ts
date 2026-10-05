import {
  collapse,
  type Collapsible,
  expand,
  isOpen,
  setupCollapsible,
} from '../../utils/collapsible';

const FAQ_ITEM = '.faq-dropdown_component';
const FAQ_TRIGGER = '.faq-dropdown_show-content';
const FAQ_CONTENT = '.faq-dropdown_hidden-content';
const FAQ_LIST = '.faq_list';

/**
 * FAQ accordion: `.faq-dropdown_component` items inside a `.faq_list`, where
 * opening one item closes the other open items of the same list. The arrow
 * rotation is handled in dropdown.css from the `.is-open` class.
 */
export function initInfoDropdown(): void {
  const items = document.querySelectorAll<HTMLElement>(FAQ_ITEM);
  if (!items.length) return;

  const collapsibles = new Map<HTMLElement, Collapsible>();

  items.forEach((item) => {
    const trigger = item.querySelector<HTMLElement>(FAQ_TRIGGER);
    const content = item.querySelector<HTMLElement>(FAQ_CONTENT);
    if (trigger && content) collapsibles.set(item, { item, trigger, content });
  });

  collapsibles.forEach((collapsible, item) => {
    const toggle = (): void => {
      if (isOpen(collapsible)) {
        collapse(collapsible);
        return;
      }

      const list = item.closest(FAQ_LIST) ?? item.parentElement ?? document;
      list.querySelectorAll<HTMLElement>(FAQ_ITEM).forEach((sibling) => {
        const other = collapsibles.get(sibling);
        if (other && other !== collapsible && isOpen(other)) collapse(other);
      });

      expand(collapsible);
    };

    setupCollapsible(collapsible, toggle);
  });
}
