# Cyberwatch — Webflow custom code

Custom TypeScript, CSS and animations for the [Cyberwatch](https://www.cyberwatch.fr/) Webflow site.

The Webflow Designer owns the markup, the content and the visual design. This repository owns everything Webflow cannot express on its own: scroll-driven animations, sliders, the navbar behaviour, accordions and a few CSS rules that are easier to maintain in code than in the Designer. The TypeScript and CSS sources here are compiled into a single JavaScript file and a single CSS file, which are then loaded by the Webflow site from a CDN.

**Nothing in this repository is deployed automatically.** Publishing a change is a deliberate three-step action: build, commit, push. See [Deploying to production](#deploying-to-production).

## Contents

- [How it fits together](#how-it-fits-together)
- [Requirements](#requirements)
- [Installation](#installation)
- [Local development](#local-development)
- [Deploying to production](#deploying-to-production)
- [Webflow integration](#webflow-integration)
  - [Critical CSS lives in Webflow, not here](#critical-css-lives-in-webflow-not-here)
- [Project structure](#project-structure)
- [Module reference](#module-reference)
- [Conventions](#conventions)
- [Available scripts](#available-scripts)
- [Continuous integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## How it fits together

```
src/**/*.ts  ─┐
              ├─ esbuild ─→ dist/index.js  ─┐
src/**/*.css ─┘            dist/index.css  ─┴─→ git push ─→ jsDelivr CDN ─→ Webflow site
```

Three important consequences of this setup:

Part of the site's CSS is **not in this repository**. Rules that must apply on the very first frame are inlined in a Webflow component instead, because the CDN stylesheet arrives too late to prevent a flash. This is the one place where the Designer, not this repo, is the source of truth for styling — see [Critical CSS lives in Webflow, not here](#critical-css-lives-in-webflow-not-here).

The `dist/` folder **is committed to git**. This is unusual for a build output, but it is deliberate here: jsDelivr serves files straight out of the GitHub repository, so the compiled files have to exist on GitHub for the live site to work. Never add `dist/` to `.gitignore`.

All code is bundled into **one entry point** (`src/index.ts`) loaded on every page of the site. Each feature guards itself: every `init*` function first looks for its own element in the DOM and returns immediately if it is absent. A slider that only exists on the homepage therefore costs nothing on the other pages, and you do not need per-page script tags.

## Requirements

- [Node.js](https://nodejs.org/) 20 or later
- [pnpm](https://pnpm.io/installation) 10 or later, installable with `npm i -g pnpm`

## Installation

```bash
pnpm install
```

Two VSCode extensions are strongly recommended, so that formatting and linting happen as you type rather than at commit time:

- [Prettier — Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Local development

Start the development server:

```bash
pnpm dev
```

This compiles the project, serves it on `http://localhost:3000`, watches your files and rebuilds on every save. Live reload is enabled, so the Webflow page you are working on refreshes by itself after each rebuild.

To see your local code running against the real site, open the Webflow Designer, go to **Project Settings → Custom Code → Footer Code**, and temporarily replace the production tags with the localhost ones:

```html
<link href="http://localhost:3000/index.css" rel="stylesheet" type="text/css" />
<script defer src="http://localhost:3000/index.js"></script>
```

Then publish to the `*.webflow.io` staging domain and work there. Remember to restore the production tags before publishing to the live domain, otherwise visitors will get a site whose scripts point at a server running on your laptop.

Before committing, make sure the code is clean:

```bash
pnpm check   # TypeScript type errors
pnpm lint    # ESLint + Prettier
```

## Deploying to production

jsDelivr serves the compiled files directly from this GitHub repository, so deploying means pushing a fresh build to `master`:

```bash
pnpm build                                  # writes dist/index.js and dist/index.css
git add dist src                            # the build output must be committed
git commit -m "describe the change"
git push origin master
```

The CDN picks the change up within a few minutes. Two things to know about caching:

jsDelivr caches branch URLs (`@master`) for **up to 12 hours**. If you need the change to be visible immediately, purge the cache by opening these two URLs in a browser:

```
https://purge.jsdelivr.net/gh/ET33-StudioRelief/Cyberwatch@master/dist/index.js
https://purge.jsdelivr.net/gh/ET33-StudioRelief/Cyberwatch@master/dist/index.css
```

Because `@master` always resolves to the latest commit, the live site has no version pinning: a bad push reaches production as soon as the cache expires. For a safer workflow, tag each release and point Webflow at the tag instead (see the next section) — tagged URLs are immutable and cached permanently.

> **The GitHub repository must stay public.** jsDelivr cannot read private repositories. If the repository is ever made private, the live site loses its JavaScript and CSS entirely.

## Webflow integration

The tags below go in the Webflow Designer, under **Project Settings → Custom Code → Footer Code**, so that they load once for the whole site.

Following the latest commit on `master`:

```html
<link
  href="https://cdn.jsdelivr.net/gh/ET33-StudioRelief/Cyberwatch@master/dist/index.css"
  rel="stylesheet"
  type="text/css"
/>
<script
  defer
  src="https://cdn.jsdelivr.net/gh/ET33-StudioRelief/Cyberwatch@master/dist/index.js"
></script>
```

Pinned to a specific release, which is the recommended option once the site is live:

```html
<link
  href="https://cdn.jsdelivr.net/gh/ET33-StudioRelief/Cyberwatch@v1.1.0/dist/index.css"
  rel="stylesheet"
  type="text/css"
/>
<script
  defer
  src="https://cdn.jsdelivr.net/gh/ET33-StudioRelief/Cyberwatch@v1.1.0/dist/index.js"
></script>
```

To publish a pinned release, tag the commit you just pushed and bump the number in the Webflow tags:

```bash
git tag v1.1.0 && git push origin v1.1.0
```

The script runs inside `window.Webflow.push()`, which means it waits for Webflow's own initialisation to finish before touching the DOM. Keep the `defer` attribute and keep the tags in the footer; moving them to the head will break that ordering.

[Finsweet Attributes](https://finsweet.com/attributes) (the `List` and `Social Share` modules) is loaded at runtime by `src/utils/finsweet.ts`. Do **not** add the Finsweet script tag in Webflow as well, or it will be loaded twice.

### Critical CSS lives in Webflow, not here

A second stylesheet exists that is **not** part of this repository. It is a `<style>` block inside a Webflow component named **`global-style-custom`**, maintained directly in the Designer.

The reason for the split is load timing. The stylesheet in this repository arrives from jsDelivr after the page has already started rendering, which is fine for decorative rules but produces a visible flash for anything structural. Rules that must be correct on the very first frame are therefore inlined in the Webflow component, where they ship with the HTML and apply instantly.

What that component owns:

- **The whole mobile and tablet navigation menu** — the closed and open states of `.navbar_menu`, its 1350px desktop reset, `html.nav-scroll-lock`, and `.nav_button`. Without it the menu would be visible and expanded on first paint before collapsing.
- **Empty slot hiding** — `[class*="-slot"]:empty { display: none }`, which collapses unfilled Webflow component slots.
- **The 1350px breakpoint helpers** — `.hide-tablet.is-breakpoint-1350` and `.hide-desktop.is-breakpoint-1350`.
- **Hiding the active locale** in the language switcher.
- **The newsletter honeypot** — `.nl-hp`, which moves the `website` trap field off-screen (not `display: none`, which some bots detect). In the repo it would be visible for a moment before the CDN stylesheet arrives:

  ```css
  .nl-hp {
    position: absolute !important;
    left: -9999px !important;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  ```

- **The `.gradient-border` family** — the gradient border technique and its `is-top-bottom`, `is-left-right`, `is-orange` and `is-light` variants.
- **Rich text typography** — heading sizes, image radius and `figcaption` styling for `.text-rich-text`, including the `.is-article` blog variant.
- **A mobile border-radius fix** on `.hp-animation_card`.

Two consequences to keep in mind when maintaining the site.

**The component must be present on every page.** It is a Webflow component, not a Project Settings code block, so a new page that forgets to include it loses all of the above — most visibly the navigation menu. If you add a page, check the component is there.

**Styling the navbar means editing two places.** `src/css/navbar.css` holds only the scroll-hide transform hint and the `.scrolled` background; everything about the menu layout is in the Webflow component. Before changing a navbar rule, decide which of the two owns it, and keep structural rules in Webflow so the no-flash guarantee survives.

This CSS is deliberately **not mirrored in this repository**, so that there is a single source of truth and no risk of the two copies drifting apart. The trade-off is that it has no git history and no backup here: deleting or overwriting the component is only recoverable through Webflow's own [backups and version history](https://help.webflow.com/hc/articles/33961259115795-Backups). Take a Webflow backup before editing it.

## Project structure

```
bin/build.js              esbuild configuration (entry points, dev server, live reload)
dist/                     compiled output — committed, served by jsDelivr, never edit by hand
src/
  index.ts                single entry point: imports the CSS and calls every init function
  index.css               imports every file in src/css/
  css/                    one stylesheet per component or page section
  typescript/
    animations/           scroll-driven GSAP animations
    components/           interactive UI (navbar, accordion, dropdown, buttons, share links, localized anchors)
    forms/                HubSpot contact form embed and newsletter form submission
    sliders/              one Swiper instance per slider
  utils/                  shared helpers (GSAP and Swiper setup, breakpoints, script loader)
tests/                    Playwright tests
```

Adding a feature follows the same three steps every time: create the module in the right `src/typescript/` subfolder and export an `init*` function that returns early when its element is missing; add its stylesheet to `src/css/` and import it from `src/index.css`; call the function from `src/index.ts`.

## Module reference

This is the contract between the code and the Webflow Designer. Renaming a class or removing an attribute listed here silently disables the corresponding feature — the code returns early instead of throwing, so the only symptom is a dead animation.

### Components

| Module                     | Required in Webflow                                                                                                 | Behaviour                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initNavbar`               | `[trigger="navbar"]` on the navbar wrapper                                                                          | Hides the navbar on scroll down, reveals it on scroll up. Adds `.scrolled` past 80px for the opaque background. Stays visible during anchor-link jumps.                                               |
| `initNavMenu`              | `[data-nav]` on the wrapper, `[data-nav-menu]` on the menu, `[data-nav-toggle]` on the burger                       | Mobile and tablet menu below 1350px. Toggles `.is-open`, locks page scroll via `.nav-scroll-lock` on `<html>`, closes on outside click, Escape, or resize to desktop.                                 |
| `initDesktopDropdownHover` | Native Webflow dropdowns inside `[trigger="navbar"]`                                                                | Opens dropdowns on hover above 1350px only. Add `.nav_dropdown-list` to a dropdown list to have it centred under its toggle instead of Webflow's full-width default.                                  |
| `initAccordion`            | `.accordion-component` containing `.accordion_show-content` (the trigger) and `.accordion_hide-content` (the panel) | Independent open/close per item, animated height. Add `data-accordion-default="open"` to expand an item on load. Compensates the scroll position so following ScrollTriggers do not jump.             |
| `initInfoDropdown`         | `.faq-dropdown_component` containing `.faq-dropdown_hidden-content`, all inside `.faq_list`                         | FAQ accordion where opening one item closes its siblings.                                                                                                                                             |
| `initGlowOrbit`            | `.button` with `data-wf--button-general--variant="base"`                                                            | Rotates the conic-gradient glow ring around the button border while hovered, by driving the `--glow-angle` custom property used in `button.css`.                                                      |
| `initFooterGlow`           | `.footer_glow-bg` positioned inside `.footer_btm-wrp`                                                               | Endless slow random drift of the footer light halo.                                                                                                                                                   |
| `initShareLinks`           | `[fs-socialshare-element="url"]` and `[data-share="copy-content"]`, article body as `.text-rich-text.is-article`    | Copy-to-clipboard for the article URL and the article text. Adds `.is-copied` for 1.5s and exposes the confirmation label as `data-copied-label` for the CSS. LinkedIn and X are handled by Finsweet. |
| `initLocalizedAnchors`     | The French section IDs listed in `localized-anchors.ts`, on the `/en` and `/es` pages                               | Webflow Localization cannot translate element IDs. Renames them to the localized slug, rewrites the matching `#` links, and scrolls to the target when the page opens with a hash.                    |

### Forms

| Module            | Required in Webflow                                                                                                                                                                                                                              | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initHubspotForm` | `[data-hs-form]` on an empty div                                                                                                                                                                                                                 | Embeds the HubSpot contact form matching the `<html lang>` (fr-FR, en-GB, es-ES), then redirects to the localized confirmation page on success. Form IDs and redirects live in `hubspot-form.ts`.                                                                                                                                                                                                             |
| `initNewsletter`  | `form[data-newsletter="form"]` with an email input, a `website` input wrapped in `.nl-hp`, `[data-newsletter="privacy"]` on the consent checkbox or its label, an optional `tracking` checkbox, and an empty `[data-newsletter="turnstile"]` div | Posts the form to the Cloudflare Worker (which forwards to HubSpot with the consent proof) instead of Webflow Forms, behind an invisible Turnstile widget. Shows Webflow's native `.w-form-done` / `.w-form-fail` blocks. The submit listener is registered before `Webflow.push` so it always runs ahead of Webflow's own form handler. Set `data-hs-do-not-collect="true"` on the form in the Designer too. |

### Animations

| Module                | Required in Webflow                                                                                                                                                                                                  | Behaviour                                                                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initHpAnimation`     | `[data-hp-animation]` wrapper containing `.hp-animation_card`, `[data-hp-content="1"]`, `[data-hp-content="2"]`, `[data-hp-logo]`, `[data-hp-scanner]`, `.hp-animation_marker-square`, `.hp-animation_marker-circle` | The homepage hero sequence, scrubbed by scroll: scanners sweep the card, markers resolve to "at risk" or cleared, then the logo crossfades into the closing lockup. Relies on `.hp-animation_sticky` being CSS-sticky inside a tall `.hp-animation_wrap`. |
| `initStepsReveal`     | `.hp-steps-card_component` with `.heading-style-h5` and `.hp-steps-card_video-wrp` inside                                                                                                                            | Staggered fade-and-rise of the step cards the first time the section enters the viewport.                                                                                                                                                                 |
| `initStackedSections` | `.section-wrapper` containing at least two `.section_step`                                                                                                                                                           | Stacked-card scroll effect: each step scrolls up over the previous one, which scales down and fades out behind it.                                                                                                                                        |
| `initStepLines`       | `.step_content` containing `.step_line`                                                                                                                                                                              | Draws each vertical timeline bar from 0% to 100% as its step crosses the viewport.                                                                                                                                                                        |
| `initStepLegendFloat` | `.step_legend-wrp` inside `.step_img-wrp`                                                                                                                                                                            | Slow vertical float of the step badges, offset from the page scroll.                                                                                                                                                                                      |
| `initJoinsUsFloat`    | `.joins-us_img-layout` containing `.joins-us_left-img-wrp`, `.joins-us_top-left-img-wrp`, `.joins-us_top-right-img-wrp`, `.join-us_btm-right-img-wrp`                                                                | Each collage image drifts at its own speed and direction, so they read as independent layers. Per-image tuning lives in `joinsUs.ts`.                                                                                                                     |
| `initBgParallax`      | `[data-parallax-bg]` on any wrapper containing an `img`                                                                                                                                                              | Generic background parallax, reusable on any section without touching the code. Tunable per element with `data-parallax-amount` (travel in %, default 5) and `data-parallax-speed` (scrub, default 1.4).                                                  |

### Sliders

Every slider follows the same pattern: a container element, plus three optional custom Webflow elements for the controls, identified by a `trigger` attribute. Swiper's own navigation and pagination markup is never used, so the controls can be designed freely in Webflow.

| Module                  | Container                     | Controls (`trigger="…"`)                                                        | Configuration                                                           |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `initIndustriesSlider`  | `.slider-industries_layout`   | `industries-prev-slide`, `industries-next-slide`, `industries-pagination`       | Auto width, 40px gap, rewind                                            |
| `initCasesSlider`       | `.features-slider_layout`     | `cases-prev-slide`, `cases-next-slide`, `cases-pagination`                      | —                                                                       |
| `initHpStepsSlider`     | `.hp-steps_layout`            | `hp-steps-prev-slide`, `hp-steps-next-slide`, `hp-steps-pagination`             | Active below 1350px only; destroyed above, where CSS handles the grid   |
| `initProgrammeSlider`   | `.programme_list-cards-wrp`   | `programme-prev-slide`, `programme-next-slide`, `programme-pagination`          | 3 slides per view, 24px gap                                             |
| `initBlogRelatedSlider` | `.slider-blog-related_layout` | `blog-related-prev-slide`, `blog-related-next-slide`, `blog-related-pagination` | Controls looked up from `.slider-blog-related_content`                  |
| `initTimelineSlider`    | `.timeline_slider`            | `timeline-prev-slide`, `timeline-next-slide`, `timeline-pagination`             | —                                                                       |
| `initTestimonialSlider` | `.testimonial_layout`         | `testimonial-prev-slide`, `testimonial-next-slide`, `testimonial-pagination`    | Centred slides, starts on the second slide when there are more than two |

Two Webflow quirks are worked around in these modules, which is worth knowing before editing them. A CMS Collection List inserts a `.w-dyn-item` wrapper, and a component slot inserts a `.card-slot` wrapper, between `.swiper-wrapper` and the actual slide. Swiper only recognises `.swiper-slide` elements that are _direct_ children of the wrapper, so the code moves the `swiper-slide` class up onto that intermediate element. Keep this in mind if slides ever stop sliding after a markup change in the Designer.

## Conventions

**Breakpoints.** `src/utils/breakpoint.ts` exports the Webflow breakpoints (`MOBILE_QUERY` ≤ 767px, `TABLET_QUERY` ≤ 991px, `DESKTOP_QUERY` ≥ 992px). Use them instead of hardcoding widths, so the code and the Designer stay in sync. The navigation menu is the one exception: it switches at 1350px, a custom breakpoint declared in both `navbar.ts` and `navbar.css`.

**GSAP.** Always import from `src/utils/gsap.ts`, never from `gsap` directly. That module registers `ScrollTrigger` once and sets the project-wide defaults (`power2.out`, 0.6s). Importing GSAP directly bypasses both.

**Swiper.** Same principle with `src/utils/swiper.ts`, which enables the `Navigation` and `Pagination` modules. Swiper's stylesheets are intentionally _not_ imported: the controls are custom Webflow markup styled by the project CSS.

**Reduced motion.** Every animation is skipped when the visitor has `prefers-reduced-motion: reduce` enabled, either through an early return or through a `gsap.matchMedia()` block. Keep this behaviour when adding animations — it is both an accessibility requirement and the reason animations do not run in some automated testing environments.

**Dynamic layout changes.** Anything that changes the page height after load (an accordion opening, an image loading late) must call `ScrollTrigger.refresh()`, otherwise the scroll animations further down the page fire at the wrong moment. `components/accordion.ts` shows the full pattern, including the scroll compensation that prevents the page from visibly jumping.

## Available scripts

| Command         | Purpose                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `pnpm dev`      | Build in watch mode and serve on `http://localhost:3000` with live reload |
| `pnpm build`    | Production build (minified, no sourcemaps) into `dist/`                   |
| `pnpm check`    | TypeScript type checking, no output emitted                               |
| `pnpm lint`     | ESLint and Prettier in check mode                                         |
| `pnpm lint:fix` | Fix every auto-fixable ESLint issue                                       |
| `pnpm format`   | Reformat the whole codebase with Prettier                                 |
| `pnpm test`     | Run the Playwright tests                                                  |

## Continuous integration

`.github/workflows/ci.yml` runs linting and type checking on every pull request, using Finsweet's shared workflows.

`.github/workflows/release.yml` and the `.changeset/` folder are leftovers from the Finsweet Developer Starter template. They are configured to publish this package to npm, which has never been done and is not needed with jsDelivr serving from GitHub. They are harmless, but you can safely delete both if you want to simplify the repository.

The `tests/` folder likewise still contains the template's demo test, which checks the Playwright documentation website and says nothing about this project. Replace it with real tests or remove it along with the `Tests` job in the CI workflow.

## Troubleshooting

**An animation or slider does nothing.** The element it looks for is missing or has been renamed. Check the [module reference](#module-reference) for the exact selector, then confirm it exists on the published page with `document.querySelector('…')` in the browser console. Also confirm the animation is not simply disabled by the operating system's reduced-motion setting.

**The site does not reflect your last push.** Either the build output was not committed (run `pnpm build` and commit `dist/`), or jsDelivr is still serving a cached copy (purge it as described in [Deploying to production](#deploying-to-production)). Check the URL actually loaded in the browser's Network tab before looking any further.

**Slides stop sliding after a Designer change.** The markup level between `.swiper-wrapper` and the slides has changed. See the note at the end of the [sliders section](#sliders).

**An animation fires too early or too late.** Something changed the page height after the ScrollTriggers were computed. Call `ScrollTrigger.refresh()` once that change settles.

**Scroll animations are jumpy on mobile.** Mobile browsers resize the viewport when the address bar collapses, which retriggers the `resize` handler. Prefer `ScrollTrigger`'s own refresh handling over custom `resize` listeners.
