import { gsap } from '../../utils/gsap';

const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

export function initFooterGlow(
  selector = '.footer_glow-bg',
  boundsSelector = '.footer_btm-wrp'
): void {
  const glow = document.querySelector<HTMLElement>(selector);
  const bounds = document.querySelector<HTMLElement>(boundsSelector);
  if (!glow || !bounds) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const wander = (): void => {
    gsap.to(glow, {
      left: `${randomBetween(10, 90)}%`,
      top: `${randomBetween(10, 90)}%`,
      duration: randomBetween(3, 6),
      ease: 'sine.inOut',
      onComplete: wander,
    });
  };

  wander();
}
