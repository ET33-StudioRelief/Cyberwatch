import { loadScript } from './loadScript';

/** Charge Finsweet Attributes (modules List + Social Share). */
export function loadFinsweetAttributes() {
  return loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js', {
    async: true,
    type: 'module',
    attributes: { 'fs-list': true, 'fs-socialshare': true },
  });
}
