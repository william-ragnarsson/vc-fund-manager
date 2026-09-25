import { useEffect, useState } from 'react';
import { App } from './app/App';
import { StoreProvider, useStore, type View } from './app/store';
import { Landing } from './landing/Landing';
import { Tour } from './tour/Tour';

// Hash routes, so the build works as a single file opened from disk:
//   #/            landing page (#how, #access jump to its sections)
//   #/demo        the app with the guided tour, from a fresh state
//   #/app[/view]  the app without the tour, optionally on a module
type Route = { page: 'landing'; anchor: string | null } | { page: 'demo' } | { page: 'app'; view: View };

const VIEWS: View[] = ['home', 'deals', 'portfolio', 'public', 'thesis'];

function parse(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (h === '/demo') return { page: 'demo' };
  const m = h.match(/^\/app(?:\/(\w+))?\/?$/);
  if (m) return { page: 'app', view: VIEWS.includes(m[1] as View) ? (m[1] as View) : 'home' };
  return { page: 'landing', anchor: /^[a-z]+$/.test(h) ? h : null };
}

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function Router() {
  const hash = useHash();
  const route = parse(hash);
  const { a } = useStore();
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    const r = parse(hash);
    if (r.page === 'demo') { a.reset(); setStep(0); }
    else setStep(null);
    if (r.page === 'app') a.go(r.view);
    document.title = r.page === 'landing' ? 'Associate' : 'Associate demo';
    const target = r.page === 'landing' && r.anchor ? document.getElementById(r.anchor) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [hash, a]);

  if (route.page === 'landing') return <Landing />;
  return (
    <>
      <App tourOpen={step !== null} />
      <Tour step={step} setStep={setStep} onOverview={() => { window.location.hash = '#/'; }} />
    </>
  );
}

export function Root() {
  return <StoreProvider><Router /></StoreProvider>;
}
