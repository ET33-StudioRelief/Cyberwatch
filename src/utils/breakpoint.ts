/** Matches Webflow mobile breakpoint (≤767px). */
export const MOBILE_QUERY = '(max-width: 767px)';

/** Matches Webflow tablet breakpoint (≤991px). */
export const TABLET_QUERY = '(max-width: 991px)';

/** Matches Webflow desktop breakpoint (≥992px). */
export const DESKTOP_QUERY = '(min-width: 992px)';

/** Everything wider than Webflow's mobile portrait breakpoint (≥480px). */
export const ABOVE_MOBILE_PORTRAIT_QUERY = '(min-width: 480px)';

/**
 * Custom 1350px breakpoint where the navigation switches between the burger menu
 * and the full desktop bar. Also used by the homepage steps slider. Must match the
 * 1350px media queries in the Webflow `global-style-custom` embed (see the README).
 */
export const NAV_DESKTOP_QUERY = '(min-width: 1350px)';

/** Exact complement of `NAV_DESKTOP_QUERY`, so the two never match at the same time. */
export const NAV_MOBILE_QUERY = '(max-width: 1349px)';
