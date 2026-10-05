import { loadScript } from '../../utils/loadScript';

/**
 * Sends `form[data-newsletter="form"]` to the Cloudflare Worker (which forwards
 * to HubSpot with the consent proof) instead of Webflow Forms, behind our own
 * invisible Turnstile widget rendered in `[data-newsletter="turnstile"]`.
 *
 * Expected inside the form: an email input, a `website` honeypot input (hidden
 * by `.nl-hp` in the critical CSS), a `[data-newsletter="privacy"]` checkbox
 * (on the input or its label) and an optional `tracking` checkbox.
 */
const ENDPOINT = 'https://cyberwatch-newsletter.anastasia-354.workers.dev';
const SITEKEY = '0x4AAAAAAFOXm-2wcDyxuV6W';
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_TIMEOUT = 15000;

interface Turnstile {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  getResponse(widgetId: string): string | undefined;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SELECTOR = 'form[data-newsletter="form"]';
const widgets = new Map<HTMLFormElement, string>();

// Webflow Localization sets fr-FR / en-GB / es-ES on <html>
const getLocale = () => (document.documentElement.lang || 'fr').slice(0, 2).toLowerCase();

const getHutk = () => document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)?.[1];

/**
 * Resolves once `window.turnstile` is usable. Webflow's native Turnstile
 * protection may already load the Cloudflare script (in implicit mode, so
 * without our `onload` callback), hence polling rather than relying on onload.
 */
function waitForTurnstile(): Promise<Turnstile | undefined> {
  if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
    loadScript(TURNSTILE_SRC, { async: true }).catch(() => {});
  }

  return new Promise((resolve) => {
    const start = Date.now();
    (function poll() {
      if (typeof window.turnstile?.render === 'function') return resolve(window.turnstile);
      if (Date.now() - start > TOKEN_TIMEOUT) return resolve(undefined);
      window.setTimeout(poll, 150);
    })();
  });
}

function getToken(form: HTMLFormElement): Promise<string> {
  return new Promise((resolve) => {
    const start = Date.now();
    (function poll() {
      const id = widgets.get(form);
      const token = id !== undefined ? window.turnstile?.getResponse(id) : '';
      if (token || Date.now() - start > TOKEN_TIMEOUT) return resolve(token || '');
      window.setTimeout(poll, 200);
    })();
  });
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches(SELECTOR)) return;
  event.preventDefault();
  event.stopPropagation();

  const wrap = form.closest('.w-form');
  const done = wrap?.querySelector<HTMLElement>('.w-form-done');
  const fail = wrap?.querySelector<HTMLElement>('.w-form-fail');
  const button = form.querySelector<HTMLButtonElement>('[type="submit"]');

  // The submit is a <button> with a decorative child, so its content is left untouched
  const setBusy = (busy: boolean) => {
    if (!button) return;
    button.disabled = busy;
    button.classList.toggle('is-loading', busy);
    form.setAttribute('aria-busy', String(busy));
  };

  if (fail) fail.style.display = 'none';
  setBusy(true);

  const privacyEl = form.querySelector('[data-newsletter="privacy"]');
  const privacy =
    privacyEl instanceof HTMLInputElement
      ? privacyEl
      : privacyEl?.querySelector<HTMLInputElement>('input[type="checkbox"]');
  const tracking = form.querySelector<HTMLInputElement>('input[name="tracking"]');

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.querySelector<HTMLInputElement>('input[type="email"]')?.value ?? '',
        website: form.querySelector<HTMLInputElement>('input[name="website"]')?.value ?? '',
        privacy: privacy?.checked ?? false,
        tracking: tracking?.checked,
        token: await getToken(form),
        locale: getLocale(),
        hutk: getHutk(),
        pageUri: window.location.href,
        pageName: document.title,
      }),
    });
    const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error ?? String(res.status));

    form.style.display = 'none';
    if (done) done.style.display = 'block';
  } catch (error) {
    console.error('[newsletter]', (error as Error).message);
    if (fail) fail.style.display = 'block';
    // Turnstile tokens are single-use
    const id = widgets.get(form);
    if (id !== undefined) window.turnstile?.reset(id);
  } finally {
    setBusy(false);
  }
}

/**
 * Called at module evaluation, not inside `Webflow.push`: the capture-phase
 * listener on `window` must be in place before Webflow's own form handler,
 * otherwise an early submission would go to Webflow Forms without consent proof.
 */
export function interceptNewsletterSubmit(): void {
  window.addEventListener('submit', (event) => void handleSubmit(event as SubmitEvent), true);
}

export async function initNewsletter(): Promise<void> {
  const forms = document.querySelectorAll<HTMLFormElement>(SELECTOR);
  if (!forms.length) return;

  // Keeps HubSpot's "non-HubSpot forms" collector from submitting a duplicate
  // without consent proof. The attribute should also be set in the Designer.
  forms.forEach((form) => form.setAttribute('data-hs-do-not-collect', 'true'));

  const turnstile = await waitForTurnstile();
  if (!turnstile) return;

  forms.forEach((form) => {
    const slot = form.querySelector<HTMLElement>('[data-newsletter="turnstile"]');
    if (!slot) return;
    widgets.set(
      form,
      turnstile.render(slot, {
        sitekey: SITEKEY,
        action: 'newsletter',
        appearance: 'interaction-only', // invisible unless Cloudflare has a doubt
        language: getLocale(),
        'refresh-expired': 'auto',
      })
    );
  });
}
