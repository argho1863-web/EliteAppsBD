'use client';
import { useEffect, useRef, useState } from 'react';

type ThreeNS = typeof import('three');

/**
 * Hero object: three digital licence cards, one per product type the store sells
 * (App, Subscription, Top-up). Rendered with three.js: extruded rounded-rect bodies
 * with a bevel, physical materials, an image-based environment for reflections.
 *
 * Interaction: the stack turns toward the pointer and rolls back as the page scrolls.
 * On capable devices the cards also breathe slowly (capped at ~30fps).
 *
 * Cost control:
 *  - low-power devices (few cores, little memory, small touch screens) get a lower
 *    pixel ratio, simpler geometry, smaller textures and no idle motion
 *  - rendering stops when the hero is off screen or the tab is hidden
 *  - if idle frames run slow, the scene drops to pixel ratio 1 and stops breathing
 *  - reduced motion: one still frame, no loop
 *  - the host reserves its own space, so the canvas arriving never shifts layout
 */

const CARDS = [
  { label: 'App',          body: '#232838', ink: '#EEF0F5', sub: '#7A8296', chip: '#F0A500', pos: [-0.85, 0.7, -0.9],  rotZ: 0.12 },
  { label: 'Subscription', body: '#EEF0F5', ink: '#0B0D14', sub: '#5C6275', chip: '#9A6700', pos: [0.0, 0.0, 0.0],     rotZ: 0.02 },
  { label: 'Top-up',       body: '#F0A500', ink: '#0B0D14', sub: '#5A3E00', chip: '#0B0D14', pos: [0.75, -0.7, 0.9],   rotZ: -0.1 },
] as const;

const W = 3.4;
const H = 2.14;
const R = 0.2;
const DEPTH = 0.06;
const BEVEL = 0.03;

function detectQuality() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const small = window.matchMedia('(max-width: 767px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? 8;
  const low = cores <= 4 || mem <= 4 || (small && coarse);
  const dpr = window.devicePixelRatio || 1;
  return {
    low,
    pixelRatio: Math.min(dpr, low ? 1.25 : small ? 1.5 : 2),
    texSize: low ? 768 : 1024,
    bevelSegments: low ? 2 : 4,
    curveSegments: low ? 10 : 20,
    maxAniso: low ? 4 : 8,
    idle: !low && !coarse,
  };
}

function roundedRectShape(THREE: ThreeNS, w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function faceTexture(THREE: ThreeNS, c: (typeof CARDS)[number], cw: number, aniso: number) {
  const k = cw / 1024; // every size below was drawn for a 1024px-wide card
  const ch = Math.round((cw * H) / W);
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  const g = cv.getContext('2d')!;
  const rad = (R / W) * cw;

  g.beginPath();
  g.moveTo(rad, 0);
  g.arcTo(cw, 0, cw, ch, rad);
  g.arcTo(cw, ch, 0, ch, rad);
  g.arcTo(0, ch, 0, 0, rad);
  g.arcTo(0, 0, cw, 0, rad);
  g.closePath();
  g.fillStyle = c.body;
  g.fill();

  // wordmark
  g.fillStyle = c.ink;
  g.font = `600 ${64 * k}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  g.textBaseline = 'alphabetic';
  g.fillText('EliteApps', 72 * k, 120 * k);

  // chip
  g.fillStyle = c.chip;
  const cx = cw - 72 * k - 120 * k, cy = 72 * k;
  g.beginPath();
  g.roundRect(cx, cy, 120 * k, 90 * k, 16 * k);
  g.fill();
  g.strokeStyle = c.body;
  g.lineWidth = 4 * k;
  g.beginPath();
  g.moveTo(cx, cy + 45 * k); g.lineTo(cx + 120 * k, cy + 45 * k);
  g.moveTo(cx + 50 * k, cy); g.lineTo(cx + 50 * k, cy + 90 * k);
  g.stroke();

  // masked key
  g.fillStyle = c.sub;
  g.font = `500 ${54 * k}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  g.fillText('••••  ••••  ••••', 72 * k, ch / 2 + 30 * k);

  // product type
  g.fillStyle = c.ink;
  g.font = `600 ${96 * k}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  g.fillText(c.label, 72 * k, ch - 72 * k);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  return tex;
}

function shadowTexture(THREE: ThreeNS) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const g = cv.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}

export default function Hero3D({ className = '' }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const THREE = await import('three');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
        if (disposed) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const q = detectQuality();

        const renderer = new THREE.WebGLRenderer({
          antialias: !q.low,
          alpha: true,
          powerPreference: q.low ? 'default' : 'high-performance',
        });
        renderer.setPixelRatio(q.pixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        // the canvas fades in after the first frame so it never pops
        canvas.style.opacity = '0';
        canvas.style.transition = reduced ? 'none' : 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)';
        el.appendChild(canvas);

        const onLost = (e: Event) => {
          e.preventDefault();
          if (!disposed) setFallback(true);
        };
        canvas.addEventListener('webglcontextlost', onLost);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = envRT.texture;
        scene.environmentIntensity = 0.7;

        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

        const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
        key.position.set(-4, 5, 6);
        scene.add(key);

        const group = new THREE.Group();
        scene.add(group);

        const disposables: Array<{ dispose: () => void }> = [];
        const cardMeshes: Array<{ obj: InstanceType<ThreeNS['Group']>; to: readonly number[]; rz: number }> = [];

        const shape = roundedRectShape(THREE, W, H, R);
        const bodyGeo = new THREE.ExtrudeGeometry(shape, {
          depth: DEPTH,
          bevelEnabled: true,
          bevelThickness: BEVEL,
          bevelSize: BEVEL,
          bevelSegments: q.bevelSegments,
          curveSegments: q.curveSegments,
        });
        bodyGeo.center();
        const faceGeo = new THREE.PlaneGeometry(W, H);
        disposables.push(bodyGeo, faceGeo);
        const frontZ = DEPTH / 2 + BEVEL + 0.003;
        const aniso = Math.min(q.maxAniso, renderer.capabilities.getMaxAnisotropy());

        for (const c of CARDS) {
          const bodyMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(c.body),
            roughness: 0.38,
            metalness: 0.15,
            clearcoat: q.low ? 0 : 0.6,
            clearcoatRoughness: 0.3,
          });
          const tex = faceTexture(THREE, c, q.texSize, aniso);
          const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.1, alphaTest: 0.5 });
          disposables.push(bodyMat, faceMat, tex);

          const card = new THREE.Group();
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          const face = new THREE.Mesh(faceGeo, faceMat);
          face.position.z = frontZ;
          card.add(body, face);
          card.position.set(0, 0, 0);
          group.add(card);
          cardMeshes.push({ obj: card, to: c.pos, rz: c.rotZ });
        }

        // contact shadow under the stack
        const shTex = shadowTexture(THREE);
        const shMat = new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false });
        const shGeo = new THREE.PlaneGeometry(1, 1);
        disposables.push(shTex, shMat, shGeo);
        const shadow = new THREE.Mesh(shGeo, shMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, -2.1, 0);
        shadow.scale.set(6.5, 4.2, 1);
        scene.add(shadow);

        // ---- state ----
        const base = { x: -0.22, y: 0.5 };
        const target = { x: base.x, y: base.y, s: 0 };
        const cur = { x: base.x, y: base.y, s: 0 };
        let intro = reduced ? 1 : 0;
        let introStart = 0;
        let inView = true;
        let raf = 0;
        let idleOn = q.idle && !reduced;
        let lastRender = 0;
        let slow = 0;
        let shown = false;

        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const canRun = () => inView && !document.hidden;

        const apply = (now: number) => {
          const k = ease(Math.min(1, Math.max(0, intro)));
          const t = now / 1000;
          for (let i = 0; i < cardMeshes.length; i++) {
            const m = cardMeshes[i];
            const bob = idleOn ? Math.sin(t * 0.9 + i * 1.7) * 0.035 * k : 0;
            m.obj.position.set(m.to[0] * k, m.to[1] * k + bob, m.to[2] * k);
            m.obj.rotation.z = m.rz * k;
          }
          group.rotation.x = cur.x + cur.s * 0.45;
          group.rotation.y = cur.y - cur.s * 0.25 + (idleOn ? Math.sin(t * 0.35) * 0.05 : 0);
          group.position.y = -cur.s * 0.7;
          renderer.render(scene, camera);
          if (!shown) {
            shown = true;
            canvas.style.opacity = '1';
          }
        };

        const tick = (now: number) => {
          raf = 0;
          if (disposed || !canRun()) return;
          if (intro < 1) {
            if (!introStart) introStart = now;
            intro = (now - introStart) / 1100;
          }
          cur.x += (target.x - cur.x) * 0.1;
          cur.y += (target.y - cur.y) * 0.1;
          cur.s += (target.s - cur.s) * 0.1;
          const moving =
            intro < 1 ||
            Math.abs(target.x - cur.x) > 0.0005 ||
            Math.abs(target.y - cur.y) > 0.0005 ||
            Math.abs(target.s - cur.s) > 0.0005;

          if (moving || !lastRender || (idleOn && now - lastRender >= 33)) {
            // if breathing frames keep arriving late, this device can't afford it
            if (idleOn && !moving && lastRender) {
              slow = now - lastRender > 70 ? slow + 1 : Math.max(0, slow - 1);
              if (slow > 12) {
                idleOn = false;
                renderer.setPixelRatio(1);
                resize();
              }
            }
            apply(now);
            lastRender = now;
          }

          if (moving || idleOn) raf = requestAnimationFrame(tick);
          else lastRender = 0;
        };
        const wake = () => { if (!raf && !disposed && canRun()) raf = requestAnimationFrame(tick); };

        function resize() {
          const w = el!.clientWidth || 1, h = el!.clientHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.position.set(0, 0, 9.5 / Math.min(1, camera.aspect));
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          lastRender = 0; // force a repaint at the new size
          wake();
        }

        const onPointer = (e: PointerEvent) => {
          if (!canRun() || reduced) return;
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          target.y = base.y + nx * 0.4;
          target.x = base.x + ny * 0.2;
          wake();
        };
        const onScroll = () => {
          if (reduced) return;
          target.s = Math.min(1, window.scrollY / 700);
          wake();
        };
        const onVisibility = () => { if (!document.hidden) wake(); };

        const ro = new ResizeObserver(resize);
        ro.observe(el);
        const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) wake(); });
        io.observe(el);
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        resize();

        cleanup = () => {
          if (raf) cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          window.removeEventListener('pointermove', onPointer);
          window.removeEventListener('scroll', onScroll);
          document.removeEventListener('visibilitychange', onVisibility);
          canvas.removeEventListener('webglcontextlost', onLost);
          disposables.forEach((d) => d.dispose());
          envRT.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          canvas.remove();
        };
        if (disposed) cleanup();
      } catch {
        if (!disposed) setFallback(true);
      }
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <div
      ref={host}
      className={`relative ${className}`}
      style={{ contain: 'layout paint' }}
      role="img"
      aria-label="Three digital licence cards: App, Subscription and Top-up"
    >
      {fallback && <StaticStack />}
    </div>
  );
}

/** Shown only when WebGL is unavailable. Same three cards, plain CSS. */
function StaticStack() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="relative w-[78%] max-w-sm aspect-[1.59]">
        {CARDS.map((c, i) => (
          <div
            key={c.label}
            className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: c.body,
              color: c.ink,
              transform: `translate(${(i - 1) * 18}px, ${(1 - i) * 18}px) rotate(${c.rotZ * 25}deg)`,
              boxShadow: 'var(--depth-2)',
            }}
          >
            <span className="font-semibold text-sm">EliteApps</span>
            <span className="font-semibold text-xl">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
