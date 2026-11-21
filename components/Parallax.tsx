'use client';
import { useRef, useEffect, type ReactNode } from 'react';

/**
 * Scroll parallax for one layer. `speed` is the fraction of scroll distance the
 * layer drifts (0.1 = moves 10% slower than the page). Transform only.
 */
export default function Parallax({
  children,
  className = '',
  speed = 0.08,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const y = Math.min(window.scrollY, window.innerHeight * 1.5);
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [speed]);

  return <div ref={ref} className={className} style={{ willChange: 'transform' }}>{children}</div>;
}
