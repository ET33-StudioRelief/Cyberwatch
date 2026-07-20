import { gsap } from '../../utils/gsap';

/** Fixed dot positions (top/left, % of the card), matching the CSS nth-child order. */
const MARKER_POSITIONS = [
  { top: 10, left: 12 },
  { top: 14, left: 48 },
  { top: 8, left: 82 },
  { top: 92, left: 88 },
  { top: 26, left: 6 },
  { top: 32, left: 70 },
  { top: 50, left: 93 },
  { top: 68, left: 8 },
  { top: 80, left: 40 },
  { top: 86, left: 63 },
  { top: 20, left: 28 },
  { top: 58, left: 52 },
  { top: 44, left: 18 },
];

/** Which dot indices each of the 5 roaming scanners visits, in order. */
const SCANNER_ROUTES = [
  [0, 5, 10],
  [1, 6, 11],
  [2, 7, 12],
  [3, 8],
  [4, 9],
];

/** Dots that resolve away (blue + scanner both clear) instead of turning orange. */
const RESOLVED_INDICES = new Set([1, 4, 8, 11]);

function buildScannerTimeline(
  scanner: HTMLElement,
  route: number[],
  circles: HTMLElement[],
  squares: HTMLElement[]
): gsap.core.Timeline {
  const t = gsap.timeline();

  route.forEach((index, i) => {
    const pos = MARKER_POSITIONS[index];

    // Scanner travels to the dot's position first, staying hidden/dim while it moves.
    if (i === 0) {
      t.set(scanner, {
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        xPercent: -50,
        yPercent: -50,
        scale: 0.6,
        opacity: 0,
      });
    } else {
      t.to(scanner, {
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        duration: 0.6,
        ease: 'power1.inOut',
      });
    }

    // The blue "resolved" dot appears on its own, and stays alone for a beat
    // before the scanner reveals itself on top of it.
    t.to(circles[index], { opacity: 1, scale: 1, duration: 0.45 }, i === 0 ? '<' : undefined);

    // Scanner arrives on top of the dot and pulses to "scan" it.
    t.to(scanner, { opacity: 1, scale: 1.15, duration: 0.3 }, '+=0.4').to(scanner, {
      scale: 1,
      duration: 0.2,
    });

    // Resolve: either the dot clears away with the scanner, or it flips to "at risk" (orange).
    if (RESOLVED_INDICES.has(index)) {
      t.to([circles[index], scanner], { opacity: 0, scale: 0.4, duration: 0.35 }, '+=0.15');
    } else {
      t.to(circles[index], { opacity: 0, duration: 0.2 }, '+=0.15')
        .to(squares[index], { opacity: 1, scale: 1.1, duration: 0.3 }, '<')
        .to(squares[index], { scale: 1, duration: 0.2 })
        .to(scanner, { opacity: 0, scale: 0.8, duration: 0.25 });
    }
  });

  t.to(scanner, { opacity: 0, scale: 0.6, duration: 0.4 });

  return t;
}

/**
 * HP hero scroll animation: a 6-step sequence driven by scroll progress.
 *
 * `.hp-animation_sticky` is CSS `position: sticky` inside a tall
 * `.hp-animation_wrap`, so it stays pinned on screen for free while the
 * wrapper scrolls through — the GSAP timeline just scrubs to that scroll
 * range, no ScrollTrigger `pin` needed.
 *
 * Sequence: (1) intro headline alone -> (2) 5 independent scanners roam the
 * card and visit the 13 fixed dot positions, each dot resolving to either
 * "at risk" (orange) or clearing away (resolved) as its scanner arrives,
 * while the headline fades out -> (3) logo fades in over the fully scanned
 * card -> (4) remaining orange dots clear -> (5) logo crossfades into the
 * closing lockup (logo + headline) as it fades in.
 *
 * @param selector - CSS selector targeting the wrapper(s).
 */
export function initHpAnimation(selector = '[data-hp-animation]'): void {
  const wrap = document.querySelector<HTMLElement>(selector);
  if (!wrap) return;

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 768px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isDesktop, reduceMotion } = (context.conditions ?? {}) as {
        isDesktop: boolean;
        reduceMotion: boolean;
      };
      if (!isDesktop || reduceMotion) return;

      const card = wrap.querySelector<HTMLElement>('.hp-animation_card');
      const content1 = wrap.querySelector<HTMLElement>('[data-hp-content="1"]');
      const content2 = wrap.querySelector<HTMLElement>('[data-hp-content="2"]');
      const logo = wrap.querySelector<HTMLElement>('[data-hp-logo]');
      const scanners = gsap.utils.toArray<HTMLElement>('[data-hp-scanner]', wrap);
      const squares = gsap.utils.toArray<HTMLElement>('.hp-animation_marker-square', wrap);
      const circles = gsap.utils.toArray<HTMLElement>('.hp-animation_marker-circle', wrap);

      if (!card || !content1 || !content2 || !logo || scanners.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      // Step 1 -> 2: scanners roam the card and resolve each dot (orange or cleared).
      // The intro headline stays put through the blue phase and only fades out
      // later, once most dots have flipped to orange (matching step 3).
      tl.addLabel('step1')
        .addLabel('scan')
        .to(content1, { opacity: 0, y: -24, duration: 2 }, 'scan+=5');

      SCANNER_ROUTES.forEach((route, i) => {
        tl.add(buildScannerTimeline(scanners[i], route, circles, squares), 'scan');
      });

      tl
        // Step 3 -> 4: logo fades in over the fully scanned card, then keeps growing
        // slowly as a continuous parallax-like scale tied to scroll.
        .addLabel('step3')
        .fromTo(logo, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 })
        .to(logo, { scale: 1.18, duration: 1.8, ease: 'none' })

        // Step 4 -> 5: remaining "at risk" dots clear out, logo remains alone
        .addLabel('step4')
        .to(squares, { opacity: 0, scale: 0.5, stagger: 0.03, duration: 1 })

        // Step 5 -> 6: card settles down to its closing size, logo crossfades
        // into the closing lockup (logo + headline)
        .addLabel('step5')
        .to(card, { height: '29.5rem', duration: 0.8 })
        .to(logo, { opacity: 0, duration: 0.8 }, '<')
        .to(content2, { opacity: 1, duration: 0.8 }, '<0.2')
        .addLabel('step6');
    }
  );
}
