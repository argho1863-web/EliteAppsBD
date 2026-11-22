'use client';
import { usePathname } from 'next/navigation';

/**
 * Fades each route in once. Keyed on the pathname, because Next only remounts a
 * root template when the top-level segment changes (so /products -> /products/123
 * would otherwise not fade). Query-string changes don't change the pathname, so
 * filters and search never re-trigger it.
 *
 * Opacity only (see `pageIn` in globals.css): no transform, so the fixed navbar
 * and modals keep their viewport positioning.
 *
 * /admin is left alone: its layout owns the sidebar, which must not flash on every
 * click. The admin layout fades its own content area instead.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return <>{children}</>;
  return <div key={pathname ?? ''} className="page-enter">{children}</div>;
}
