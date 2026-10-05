/**
 * French element ID -> localized slug, per locale. One map per locale covers
 * the whole site: an ID that does not exist on the current page is skipped.
 */
const ANCHOR_MAPS: Record<string, Record<string, string>> = {
  en: {
    // Product sections of the platform pages
    'gestion-des-vulnerabilites': 'vulnerability-management',
    'gestion-des-configurations': 'configuration-management',
    'gestion-surface-attaque-externe': 'external-attack-surface-management',
    'gestion-surface-attaque-cloud': 'cloud-attack-surface-management',
    'configuration-cloud-cspm': 'cloud-configuration-cspm',
    'scan-infrastructure': 'infrastructure-scan',
    'securisez-supply-chain': 'secure-your-supply-chain',
    'scan-images-conteneurs': 'container-image-scan',
    // Steps of the CTEM wheel ("rosace")
    priorisez: 'prioritize',
    cartographiez: 'map',
    detectez: 'detect',
    decidez: 'decide',
    corrigez: 'fix',
  },
  es: {
    // Product sections of the platform pages
    'gestion-des-vulnerabilites': 'gestion-de-vulnerabilidades',
    'gestion-des-configurations': 'gestion-de-configuraciones',
    'patch-management': 'gestion-de-parches',
    'gestion-surface-attaque-externe': 'gestion-superficie-ataque-externa',
    'api-scanning': 'escaneo-de-apis',
    'gestion-surface-attaque-cloud': 'gestion-superficie-ataque-cloud',
    'configuration-cloud-cspm': 'configuracion-cloud-cspm',
    'scan-infrastructure': 'escaneo-de-infraestructura',
    'securisez-supply-chain': 'protege-tu-cadena-de-suministro',
    'scan-images-conteneurs': 'escaneo-imagenes-contenedores',
    // Steps of the CTEM wheel ("rosace")
    priorisez: 'priorice',
    cartographiez: 'mapee',
    detectez: 'detecte',
    decidez: 'decida',
    corrigez: 'corrija',
  },
};

/** `decodeURIComponent` throws on a malformed `%` sequence; keep the raw value instead. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Webflow Localization cannot translate element IDs, so anchored sections keep
 * their French IDs on /en and /es. This swaps them for the localized slug,
 * rewrites every link whose hash is one of those IDs, and when the page is
 * opened with a French hash, replaces it in the address bar and scrolls to
 * the target.
 */
export function initLocalizedAnchors(): void {
  const match = window.location.pathname.match(/^\/(en|es)(\/|$)/);
  const lang = match ? match[1] : document.documentElement.lang.slice(0, 2);
  const map = ANCHOR_MAPS[lang];
  if (!map) return;

  Object.entries(map).forEach(([fr, localized]) => {
    const el = document.getElementById(fr);
    if (el) el.id = localized;
  });

  // Exact hash match, so `#scan` would never rewrite a `#scan-infrastructure` link
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const hashIndex = href.indexOf('#');
    const localized = map[safeDecode(href.slice(hashIndex + 1))];
    if (localized) link.setAttribute('href', `${href.slice(0, hashIndex)}#${localized}`);
  });

  if (!window.location.hash) return;

  const hash = safeDecode(window.location.hash.slice(1));
  const localized = map[hash];
  if (localized) {
    // Absolute URL, so a <base> element cannot resolve it to another origin
    const url = new URL(window.location.href);
    url.hash = localized;
    window.history.replaceState(null, '', url.href);
  }

  const target = document.getElementById(localized ?? hash);
  // Delayed so it wins over the browser's own hash scroll, which ran before the IDs were renamed
  if (target) window.setTimeout(() => target.scrollIntoView(), 150);
}
