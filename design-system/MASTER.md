# EliteApps BD design system

Source of truth for the tokens already in `app/globals.css` and `tailwind.config.ts`. Nothing here is new: it documents what the code does so the next change stays consistent.

## Colour

| Token | Value | Use |
|---|---|---|
| `--bg` / `brand-navy` | `#0B0D14` | Page background |
| `--bg-deep` / `brand-navy-2` | `#07080D` | Footer, sidebar, scrollbar track |
| `--card` / `brand-navy-3` | `#11141C` | Cards, dialogs |
| `--raised` / `brand-navy-4` | `#1A1E28` | Image placeholders, active nav item |
| `--text` | `#EEF0F5` | Body text |
| `--text-2`, `--text-3` | `#A3A9B8`, `#7A8296` | Secondary text. Muted text on the UI uses `text-white/55` or higher (4.5:1 on `--bg`) |
| `--gold` / `brand-gold` | `#F0A500` | The one accent: primary buttons, prices, focus |
| `--accent` | `#E5484D` | Discount badge, destructive actions |

Rules
- One flat accent (gold). No gradients between hues, no coloured glow. Depth comes from the layered neutral shadows `--depth-1`, `--depth-2`, `--depth-inset`.
- No purple, violet or indigo in the interface. The one exception is the Rocket wallet panel on `/checkout`, which uses Rocket's own flat brand colour so people can match it to the app they are paying in. The footer dot for Rocket is neutral grey.

## Type

Geist (body and display, `--font-body`), Geist Mono for transaction IDs and codes. Body text is 16px at 1.5 line height. Form fields are 16px on mobile so iOS does not zoom (`text-base sm:text-sm`).

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Everything that enters |
| `--dur-press` | 120ms | Press feedback (`active:scale-[0.97]`) |
| `--dur-hover` | 180ms | Hover, colour changes |
| `--dur-enter` | 450ms | Entrances (`animate-fade-up`) |

Shared classes
- `animate-fade-up` + `stagger-i` with `style={stagger(i)}` (from `components/motion.ts`, capped at 8 steps): entrance cascade. `stagger-*` must stay after `animate-*` in the CSS or the delay resets.
- `page-enter`: route fade. Opacity only, because a transform on an ancestor would trap `position: fixed` children.
- `drawer-backdrop` / `drawer-panel` with `data-open`: always-mounted overlays that animate in and out and leave the tab order when closed. Used by the nav drawer, admin sidebar and language prompt.
- `row-collapse`, `grow-x`, `animate-pop`, `animate-shake`: list removal, bar fill, badge bump, failed submit.
- Animate `transform` and `opacity` only. Hover rules sit behind `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion` turns every one of these off or to an instant change, in the block at the end of the CSS file.

## Touch and layout

- Tap targets are at least 44px on touch (`@media (pointer: coarse)` for `.btn-gold`, `.btn-key`; explicit `min-h-[44px]` elsewhere).
- Safe-area insets on body, fixed headers and bottom sheets. `overflow-x: clip` on body, `100dvh` for full height.
- 3D (`Hero3D`) lowers pixel ratio and geometry on small or low-power devices, pauses offscreen and when the tab is hidden, and reserves its box to avoid layout shift. `Tilt` and `Parallax` run only on a fine pointer without reduced motion.

## Copy

Plain, specific to the shop: what the product is, what it costs, how delivery works. No filler such as "elevate", "seamless", "next-generation" or "cutting-edge". Do not repeat the same sentence across cards.

## Known gaps

- Admin sub-pages (`/admin/products`, `orders`, `reviews`, `import`, dashboard) inherit the layout, fade and shared styles. Many of their form fields still rely on placeholders instead of visible labels, and the product edit/delete icon buttons are 36px on touch. `/admin/categories` has been done.
- Not yet run: `npm run build`, `npm run lint`, a browser pass on a real phone.
