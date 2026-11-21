'use client';
import { useRef, useEffect, type ReactNode } from 'react';

/**
 * Scroll parallax for one decorative layer (never body text). `speed` is the
 * fraction of scroll distance the layer drifts (0.1 = moves 10% slower than the page).
 *
 * Runs only while the layer is on screen, only on wide screens with a real
 * pointer, and never under reduced motion. Elsewhere the layer simply sits still.
 * Transform only, and `will-change` is held just while it is moving.
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
    const el = ref.current;
    if (!el) return;
    const ok = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!ok.matches) return;

    let raf = 0;
    let inView = true;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, window.innerHeight * 1.5);
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (inView && !raf) raf = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      el.style.willChange = inView ? 'transform' : 'auto';
      if (inView) onScroll();
    });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
      el.style.willChange = 'auto';
    };
  }, [speed]);

  return <div ref={ref} className={className}>{children}</div>;
}
