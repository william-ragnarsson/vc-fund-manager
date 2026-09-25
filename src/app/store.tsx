import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { BLANK, EXAMPLE, isBlank, isComplete, screenApplication, type Application } from '../apply/screen';
import { FUND } from '../config';
import { seedCompanies, seedDeals, seedDrafts, seedPublished } from '../data/seed';
import type { Company, Deal, DealStage, Draft, Published } from '../data/types';

/** 'apply' is the founder-facing apply page; every other view is the fund's app. */
export type View = 'home' | 'deals' | 'portfolio' | 'public' | 'thesis' | 'apply';
export type AutoKey = 'invest' | 'raise' | 'milestone' | 'event' | 'site';
export type AutoMode = 'approval' | 'auto' | 'off';

export interface State {
  view: View;
  deals: Deal[];
  selId: string | null;
  companies: Company[];
  coId: string | null;
  pTab: 'cards' | 'table' | 'feed';
  pubTab: 'drafts' | 'published' | 'website' | 'auto';
  dfTab: DealStage;
  drafts: Draft[];
  published: Published[];
  auto: Record<AutoKey, AutoMode>;
  editing: string | null;
  editText: string;
  toast: string | null;
  threshold: number;
  geos: Record<string, boolean>;
  weights: { team: number; market: number; traction: number; fit: number };
  declineNote: string;
  sectors: Record<string, boolean>;
  stages: Record<string, boolean>;
  /** The apply page: the founder's draft, whether it was sent, and the deal it became. */
  appForm: Application;
  appSent: boolean;
  appliedId: string | null;
}

const initialState = (): State => ({
  view: 'home', deals: seedDeals(), selId: null, companies: seedCompanies(), coId: null,
  pTab: 'cards', pubTab: 'drafts', dfTab: 'meeting',
  drafts: seedDrafts(), published: seedPublished(),
  auto: { invest: 'approval', raise: 'approval', milestone: 'auto', event: 'auto', site: 'auto' },
  editing: null, editText: '', toast: null, threshold: 60,
  geos: { US: true, Europe: true, UK: true, Israel: false, LatAm: false },
  weights: { team: 35, market: 25, traction: 25, fit: 15 },
  declineNote: `Thank you for sharing {company} with us. After a careful look, it isn't the right fit for ${FUND.possessive} current fund focus. This says nothing about the quality of what you're building, and we'd be glad to hear from you again as things progress.`,
  sectors: { 'B2B SaaS': true, 'Vertical AI': true, 'AI infrastructure': true, 'Developer tools': false, Fintech: false, Climate: false },
  stages: { 'Pre-seed': true, Seed: true, 'Series A': false },
  appForm: BLANK, appSent: false, appliedId: null,
});

const STAGE_LABEL: Record<DealStage, string> = { inbound: 'Inbound', screened: 'Screened', meeting: 'Meetings' };

function investDraft(d: Deal): Draft {
  const round = d.round.split(' · ')[0];
  return {
    id: 'p' + Date.now(), type: 'invest', typeLabel: 'New investment', companyId: d.id, company: d.name,
    detected: 'Investment closed · just now',
    text: `We're thrilled to welcome @${d.name} to the ${FUND.name} portfolio.\n\n${d.name}: ${d.one}. We were impressed by the team's speed and clarity from the very first conversation.\n\nWelcome aboard.`,
    tags: `#VentureCapital #${round.replace(/[^A-Za-z]/g, '')} #B2BSaaS #AI`,
    site: { kicker: 'Sep 2026 · New investment', title: `${FUND.name} invests in ${d.name}`, body: d.one + '.' },
    siteNote: 'Adds to Recent and the portfolio page.',
    image: { kicker: 'New investment', title: `Welcome to the portfolio, ${d.name}`, sub: `${d.one} · ${round}` },
    imgBg: '#2c3f5c',
  };
}

function useAssociateStore() {
  const [s, setS] = useState<State>(initialState);
  const timer = useRef<number | undefined>(undefined);
  const ref = useRef(s);
  ref.current = s;
  const set = useCallback((patch: Partial<State> | ((prev: State) => Partial<State>)) => {
    setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const actions = useMemo(() => {
    const toast = (msg: string) => {
      set({ toast: msg });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => set({ toast: null }), 3400);
    };
    const go = (view: View) => set({ view, coId: null, selId: null, editing: null });

    /** Screens the founder's draft against the current thesis and adds it to Inbound. */
    const submitApplication = () => {
      const d = screenApplication(ref.current.appForm, ref.current);
      set(prev => ({ deals: [d, ...prev.deals], appSent: true, appliedId: d.id }));
    };

    const moveDeal = (id: string, stage: DealStage) => {
      const d = ref.current.deals.find(x => x.id === id);
      if (!d || d.stage === stage) return;
      const upd: Partial<Deal> = { stage };
      if (stage === 'meeting' && !d.meeting) upd.meeting = { day: 'TBC', date: '·', time: 'Invite sent · founders picking a slot' };
      set(prev => ({ deals: prev.deals.map(x => (x.id === id ? { ...x, ...upd } : x)) }));
      toast(stage === 'meeting' ? `Calendar invite sent to ${d.name} founders.` : `${d.name} moved to ${STAGE_LABEL[stage]}.`);
    };

    const pass = (d: Deal) => {
      set(prev => ({ deals: prev.deals.filter(x => x.id !== d.id), selId: null }));
      toast(`Passed on ${d.name}. A personal note was sent to the founders.`);
    };

    const invest = (d: Deal) => {
      const round = d.round.split(' · ')[0];
      const co: Company = {
        id: d.id, name: d.name, one: d.one, about: '', sector: d.sector, city: d.loc, country: '', website: d.website,
        stage: round, inv: `${round} · Sep 2026`, signal: 'Investment closed', src: 'Fund', when: 'Just now', status: 'New',
        signals: [{ date: 'Today', src: 'Fund', text: 'Investment closed', note: 'Now tracked automatically' }],
      };
      const draft = investDraft(d);
      const autoPost = ref.current.auto.invest === 'auto';
      set(prev => ({
        deals: prev.deals.filter(x => x.id !== d.id), selId: null, companies: [co, ...prev.companies],
        drafts: autoPost ? prev.drafts : [draft, ...prev.drafts],
        published: autoPost
          ? [{ id: draft.id, typeLabel: draft.typeLabel, companyId: d.id, company: d.name, text: draft.text, site: draft.site, date: 'Just now', channels: 'LinkedIn + Website', auto: true }, ...prev.published]
          : prev.published,
      }));
      toast(autoPost ? `${d.name} added to portfolio and announced automatically.` : `${d.name} added to portfolio. Announcement drafted in Public Presence.`);
    };

    const approve = (id: string) => {
      const cur = ref.current;
      const p = cur.drafts.find(x => x.id === id);
      if (!p) return;
      const text = cur.editing === id ? cur.editText : p.text;
      set(prev => ({
        drafts: prev.drafts.filter(x => x.id !== id), editing: null,
        published: [{ id: p.id, typeLabel: p.typeLabel, companyId: p.companyId, company: p.company, text, site: p.site, date: 'Just now', channels: 'LinkedIn + Website', auto: false }, ...prev.published],
        companies: p.type === 'raise' ? prev.companies.map(c => (c.id === p.companyId ? { ...c, stage: 'Series A' } : c)) : prev.companies,
      }));
      toast(`Published to LinkedIn and ${FUND.domain}.`);
    };

    return {
      set, toast, go, moveDeal, pass, invest, approve, submitApplication,
      /** The tour shows the example filled in, unless the presenter already started one. */
      prefillApplication: () => set(prev => (!prev.appSent && isBlank(prev.appForm) ? { appForm: EXAMPLE } : {})),
      /** Moving on in the tour sends a finished draft, so the next step can show it arrive. */
      sendDraft: () => { if (!ref.current.appSent && isComplete(ref.current.appForm)) submitApplication(); },
      seeApplication: () => set(prev => ({ view: 'deals', dfTab: 'inbound', selId: prev.appliedId, coId: null, editing: null })),
      newApplication: () => set({ appForm: BLANK, appSent: false }),
      openDeal: (id: string) => set({ selId: id }),
      closeDeal: () => set({ selId: null }),
      openCompany: (id: string) => set({ view: 'portfolio', coId: id, selId: null }),
      closeCompany: () => set({ coId: null }),
      discard: (id: string) => { set(prev => ({ drafts: prev.drafts.filter(x => x.id !== id), editing: null })); toast('Draft discarded.'); },
      toggleEdit: (id: string) => set(prev => {
        if (prev.editing === id) return { drafts: prev.drafts.map(x => (x.id === id ? { ...x, text: prev.editText } : x)), editing: null };
        return { editing: id, editText: prev.drafts.find(x => x.id === id)?.text ?? '' };
      }),
      setAuto: (key: AutoKey, v: AutoMode, label: string, optLabel: string) => {
        set(prev => ({ auto: { ...prev.auto, [key]: v } }));
        toast(`${label}: ${optLabel.toLowerCase()}.`);
      },
      toggleChip: (key: 'geos' | 'sectors' | 'stages', label: string) => set(prev => ({ [key]: { ...prev[key], [label]: !prev[key][label] } })),
      saveThesis: () => toast('Thesis saved. Re-scoring 131 screened applications.'),
      reset: () => { window.clearTimeout(timer.current); setS(initialState()); },
    };
  }, [set]);

  return { s, a: actions };
}

type Store = ReturnType<typeof useAssociateStore>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useAssociateStore();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
