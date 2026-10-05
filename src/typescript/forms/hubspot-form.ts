import { loadScript } from '../../utils/loadScript';

const PORTAL_ID = '146882385';
const REGION = 'eu1';
const DEFAULT_LANG = 'fr-fr';

/** HubSpot form ID and confirmation page per `<html lang>` value. */
const FORMS: Record<string, { id: string; redirect: string }> = {
  'fr-fr': {
    id: '3e12b60a-465c-4d90-88f8-55fb2f6b7ba6',
    redirect: '/contact/confirmation-contact',
  },
  'en-gb': {
    id: '1d31ef19-0f49-4e35-a636-da2fe5db48dc',
    redirect: '/en/contact/contact-confirmation',
  },
  'es-es': {
    id: 'ce61afc7-19a3-442d-9588-2d81f5ce4547',
    redirect: '/es/contact/confirmacion-de-contacto',
  },
};

/**
 * Embeds the HubSpot contact form in every `[data-hs-form]` element, picking
 * the form that matches the page locale, and redirects to the localised
 * confirmation page once HubSpot reports a successful submission.
 */
export function initHubspotForm(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-hs-form]');
  if (!targets.length) return;

  const lang = (document.documentElement.lang || DEFAULT_LANG).toLowerCase();
  const cfg = FORMS[lang] ?? FORMS[DEFAULT_LANG];

  targets.forEach((el) => {
    el.classList.add('hs-form-frame');
    el.dataset.region = REGION;
    el.dataset.portalId = PORTAL_ID;
    el.dataset.formId = cfg.id;
  });

  window.addEventListener('hs-form-event:on-submission:success', (event) => {
    const { detail } = event as CustomEvent<{ formId?: string } | undefined>;
    if (detail?.formId === cfg.id) window.location.href = cfg.redirect;
  });

  loadScript(`https://js-${REGION}.hsforms.net/forms/embed/${PORTAL_ID}.js`, { defer: true });
}
