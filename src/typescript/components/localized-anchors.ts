/** French section ID -> localized slug, per locale. */
const ANCHOR_MAPS: Record<string, Record<string, string>> = {
  en: {
    'gestion-des-vulnerabilites': 'vulnerability-management',
    'gestion-des-configurations': 'configuration-management',
    'gestion-surface-attaque-externe': 'external-attack-surface-management',
    'gestion-surface-attaque-cloud': 'cloud-attack-surface-management',
    'configuration-cloud-cspm': 'cloud-configuration-cspm',
    'scan-infrastructure': 'infrastructure-scan',
    'securisez-supply-chain': 'secure-your-supply-chain',
    'scan-images-conteneurs': 'container-image-scan',
  },
  es: {
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
  },
};

/**
 * Webflow Localization cannot translate element IDs, so the product sections
 * keep their French IDs on /en and /es. This swaps them for the localised
 * slug, rewrites the matching in-page links, and scrolls to the target when
 * the page is opened with a hash.
 */
export function initLocalizedAnchors(): void {
  const match = window.location.pathname.match(/^\/(en|es)(\/|$)/);
  const lang = match ? match[1] : document.documentElement.lang.slice(0, 2);
  const map = ANCHOR_MAPS[lang];
  if (!map) return;

  Object.entries(map).forEach(([fr, localized]) => {
    const el = document.getElementById(fr);
    if (el) el.id = localized;

    document.querySelectorAll<HTMLAnchorElement>(`a[href*="#${fr}"]`).forEach((link) => {
      link.setAttribute('href', link.getAttribute('href')!.replace(`#${fr}`, `#${localized}`));
    });
  });

  if (!window.location.hash) return;

  const hash = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(map[hash] ?? hash);
  // Delayed so it wins over the browser's own hash scroll, which ran before the IDs were renamed
  if (target) window.setTimeout(() => target.scrollIntoView(), 150);
}
