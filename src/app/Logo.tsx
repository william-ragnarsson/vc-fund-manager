import meta from '../data/logo-meta.json';

// Square logo tiles built by data/build_logos.py, inlined into the bundle.
const files = import.meta.glob('../assets/logos/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const LOGOS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.png', ''), url]),
);
const META = meta as Record<string, { bleed: boolean; bg: string }>;

/** Generated mark for companies without a logo file (from the original design). */
function generated(name: string) {
  let x = 0;
  for (const ch of name) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  const pal = [['#1f2c40', '#9fc1e8'], ['#c9764f', '#fbe7d9'], ['#2f6f73', '#bfe3de'], ['#8a6fa8', '#efe6f7'], ['#d0a24c', '#3a2a0c'], ['#dfe6f0', '#3b5478'], ['#6b8f71', '#eaf3e6'], ['#b85c6e', '#fde8ec'], ['#262a33', '#f0c35b'], ['#f1e4d3', '#c9764f']];
  const shapes = [{ w: '50%', h: '50%', r: '999px', t: 'none' }, { w: '36%', h: '36%', r: '3px', t: 'rotate(45deg)' }, { w: '56%', h: '28%', r: '999px 999px 0 0', t: 'translateY(-20%)' }, { w: '46%', h: '46%', r: '100% 0 0 0', t: 'translate(10%,10%)' }, { w: '62%', h: '22%', r: '999px', t: 'rotate(-35deg)' }, { w: '42%', h: '42%', r: '4px', t: 'none' }];
  const [bg, fg] = pal[x % pal.length];
  return { bg, fg, ...shapes[(x >>> 3) % shapes.length], o2: (x >>> 7) % 3 === 0 ? 0 : 0.55 };
}

export function Logo({ id, name, size, radius, ring = true }: { id: string; name: string; size: number; radius: number; ring?: boolean }) {
  const url = LOGOS[id];
  const box = { width: size, height: size, borderRadius: radius };
  if (!url) {
    const g = generated(name);
    return (
      <div className="logo" style={{ ...box, background: g.bg }} aria-hidden="true">
        <div style={{ gridArea: '1/1', width: g.w, height: g.h, borderRadius: g.r, background: g.fg, transform: g.t }} />
        <div style={{ gridArea: '1/1', width: '16%', height: '16%', borderRadius: 999, background: g.fg, opacity: g.o2, transform: 'translate(150%,-150%)' }} />
      </div>
    );
  }
  const m = META[id];
  return (
    <div className={ring ? 'logo ring' : 'logo'} style={{ ...box, background: m?.bg ?? '#fff' }}>
      <img src={url} alt={`${name} logo`} width={size} height={size} draggable={false} />
    </div>
  );
}
