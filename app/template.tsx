/**
 * Re-mounts on every navigation, so each route fades in once.
 * Opacity only (see `pageIn` in globals.css): no transform, so the fixed
 * navbar and modals keep their viewport positioning.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
