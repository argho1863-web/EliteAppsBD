'use client';
import { useRef, useEffect, useCallback, type ReactNode } from 'react';

/**
 * Pointer-driven tilt. The outer element is static and owns the hit area, so
 * the rotating plane can never move out from under the pointer and flicker.
 * Children can sit above the plane with the .lift-1 / .lift-2 / .lift-3 classes.
 * Does nothing for touch input or when the person prefers reduced motion; the
 * reduced-motion setting is followed live, not just read once at mount.
 */
export default function Tilt({
  children,
  className = '',
  innerClassName = '',
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** maximum rotation in degrees */
  max?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { enabled.current = fine.matches && !calm.matches; };
    sync();
    fine.addEventListener('change', sync);
    calm.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      calm.removeEventListener('change', sync);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!enabled.current || e.pointerType !== 'mouse') return;
    const w = wrap.current, p = plane.current;
    if (!w || !p) return;
    const { clientX, clientY } = e;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = w.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;   // 0..1
      const py = (clientY - r.top) / r.height;   // 0..1
      p.dataset.active = 'true';
      p.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      p.style.setProperty('--rx', `${(-(py - 0.5) * 2 * max).toFixed(2)}deg`);
      p.style.setProperty('--s', '1.015');
      p.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      p.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });
  }, [max]);

  const onLeave = useCallback(() => {
    const p = plane.current;
    if (!p) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    p.dataset.active = 'false';
    p.style.setProperty('--rx', '0deg');
    p.style.setProperty('--ry', '0deg');
    p.style.setProperty('--s', '1');
  }, []);

  return (
    <div ref={wrap} className={`tilt-wrap ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={plane} className={`tilt ${innerClassName}`}>{children}</div>
    </div>
  );
}
