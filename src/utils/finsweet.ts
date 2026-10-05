import { loadScript } from './loadScript';

/**
 * Loads Finsweet Attributes v2 with the List and Social Share modules. Do not
 * also add the Finsweet script tag in Webflow, or it would load twice.
 */
export function loadFinsweetAttributes() {
  return loadScript('https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js', {
    async: true,
    type: 'module',
    attributes: { 'fs-list': true, 'fs-socialshare': true },
  });
}
