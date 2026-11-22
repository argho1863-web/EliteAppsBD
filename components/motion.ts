import type { CSSProperties } from 'react';

/**
 * Index-driven entrance delay for lists and stacked blocks.
 * Pair with the `animate-fade-up stagger-i` classes. Capped, so the last item
 * of a long list never waits more than ~360ms.
 */
export function stagger(i: number): CSSProperties {
  return { '--i': Math.min(Math.max(i, 0), 8) } as CSSProperties;
}

/** True when the person asked the OS for less motion. Safe to call on the client only. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
