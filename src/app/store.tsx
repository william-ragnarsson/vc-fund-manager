import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FUND, TODAY } from '../config';
import * as api from '../data/api';
import type { AutoKey, AutoMode, Company, Deal, DealStage, Draft, FormerCompany, Fund, Published, Rubric } from '../data/types';
import { lastActive, monthYear } from './activity';

export type View = 'home' | 'deals' | 'portfolio' | 'public' | 'thesis';
export type { AutoKey, AutoMode } from '../data/types';

export interface State {
  /** Whether the fund's data has arrived from Supabase. */
  status: 'loading' | 'ready' | 'error';
  view: View;
  fund: Fund;
  /** The thesis as last saved. The Thesis page edits threshold, weights and the rest below until Save. */
  rubric: Rubric;
  deals: Deal[];
  selId: string | null;
  companies: Company[];
  /** Acquired or shut down, under Portfolio → Former. */
  former: FormerCompany[];
  coId: string | null;
  /** Portfolio: which companies (tabs), how they're grouped and sorted, and cards or table. */
  pFilter: 'current' | 'quiet' | 'former';
  pGroup: 'none' | 'batch' | 'stage';
  pSort: 'latest' | 'quiet' | 'name';
  pLayout: 'cards' | 'table';
  /** Companies whose founders got a check-in. */
  checkIns: string[];
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
  /** Weight per rubric criterion, keyed by criterion key. */
  weights: Record<string, number>;
  declineNote: string;
  sectors: Record<string, boolean>;
  stages: Record<string, boolean>;
}

const initialState = (): State => ({
  status: 'loading', view: 'home', fund: api.EMPTY_FUND, rubric: api.EMPTY_RUBRIC,
  deals: [], selId: null, companies: [], former: [], coId: null,
  pFilter: 'current', pGroup: 'none', pSort: 'latest', pLayout: 'cards', checkIns: [], pubTab: 'drafts', dfTab: 'meeting',
  drafts: [], published: [],
  auto: { invest: 'approval', raise: 'approval', milestone: 'approval', event: 'approval', site: 'approval' },
  editing: null, editText: '', toast: null,
  threshold: 60, geos: {}, weights: {}, declineNote: '', sectors: {}, stages: {},
});

/** The fund's data as state. The thesis form starts from the rubric as saved. */
const fromData = (d: api.FundData): Partial<State> => ({
  fund: d.fund, rubric: d.rubric, companies: d.companies, former: d.former, deals: d.deals,
  drafts: d.drafts, published: d.published, checkIns: d.checkIns, auto: d.auto,
  threshold: d.rubric.threshold, sectors: d.rubric.sectors, stages: d.rubric.stages, geos: d.rubric.geos,
  weights: Object.fromEntries(d.rubric.criteria.map(c => [c.key, c.weight])), declineNote: d.rubric.declineNote,
});

const STAGE_LABEL: Record<DealStage, string> = { inbound: 'Inbound', screened: 'Screened', meeting: 'Meetings' };

function investDraft(d: Deal): Draft {
  const round = d.round.split(' · ')[0];
  return {
    id: api.newId(), type: 'invest', typeLabel: 'New investment', companyId: d.id, company: d.name,
    detected: 'Investment closed · just now',
    text: `We're thrilled to welcome @${d.name} to the ${FUND.name} portfolio.\n\n${d.name}: ${d.one}. We were impressed by the team's speed and clarity from the very first conversation.\n\nWelcome aboard.`,
    tags: `#VentureCapital #${round.replace(/[^A-Za-z]/g, '')} #B2BSaaS #AI`,
    channels: 'LinkedIn + Website',
    site: { kicker: `${monthYear(TODAY)} · New investment`, title: `${FUND.name} invests in ${d.name}`, body: d.one + '.' },
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

  // Writes run one at a time, in the order the partner made them. Only the newest load is applied.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const loading = useRef<Promise<void> | null>(null);
  const resetting = useRef<Promise<void> | null>(null);
  const seq = useRef(0);

  const actions = useMemo(() => {
    const toast = (msg: string) => {
      set({ toast: msg });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => set({ toast: null }), 3400);
    };
    const go = (view: View) => set({ view, coId: null, selId: null, editing: null });

    const enqueue = <T,>(write: () => Promise<T>) => {
      const run = queue.current.then(write);
      queue.current = run.then(() => {}, () => {});
      return run;
    };

    /** Loads the fund once pending writes have landed, and again if more came in meanwhile, so it never undoes what's on screen. */
    const load = (): Promise<void> => {
      if (loading.current) return loading.current;
      const n = ++seq.current;
      const reset = resetting.current;
      const run: Promise<void> = (async () => {
        try {
          await reset;
          for (;;) {
            const q = queue.current;
            await q;
            const data = await api.loadFund();
            if (n !== seq.current) return;
            if (q === queue.current) { set({ status: 'ready', ...fromData(data) }); return; }
          }
        } catch (e) {
          console.error(e);
          if (n === seq.current) set({ status: 'error' });
        }
      })().finally(() => { if (loading.current === run) loading.current = null; });
      loading.current = run;
      return run;
    };

    /** Writes a change the page already shows. If the write fails, the page goes back to what was saved. */
    const save = (write: () => Promise<unknown>) => {
      enqueue(write).catch(e => {
        console.error(e);
        toast("That change didn't save. Showing the latest data.");
        load();
      });
    };

    const moveDeal = (id: string, stage: DealStage) => {
      const d = ref.current.deals.find(x => x.id === id);
      if (!d || d.stage === stage) return;
      const upd: Partial<Deal> = { stage };
      if (stage === 'meeting' && !d.meeting) upd.meeting = { day: 'TBC', date: '·', time: 'Invite sent · founders picking a slot' };
      set(prev => ({ deals: prev.deals.map(x => (x.id === id ? { ...x, ...upd } : x)) }));
      toast(stage === 'meeting' ? `Calendar invite sent to ${d.name} founders.` : `${d.name} moved to ${STAGE_LABEL[stage]}.`);
      save(() => (stage === 'meeting' ? api.inviteToMeeting(d.rowId) : api.moveApplication(d.rowId, stage)));
    };

    const pass = (d: Deal) => {
      set(prev => ({ deals: prev.deals.filter(x => x.id !== d.id), selId: null }));
      toast(`Passed on ${d.name}. A personal note was sent to the founders.`);
      save(() => api.passApplication(d.rowId));
    };

    const invest = (d: Deal) => {
      const cur = ref.current;
      const round = d.round.split(' · ')[0];
      const co: Company = {
        id: d.id, rowId: d.companyRowId, name: d.name, one: d.one, about: '', sector: d.sector, city: d.loc, country: '', website: d.website,
        stage: round, inv: `${round} · ${monthYear(TODAY)}`, signal: 'Investment closed', src: 'Fund', when: 'Just now', status: 'New',
        signals: [{ on: TODAY, src: 'Fund', text: 'Investment closed', note: 'Now tracked automatically' }],
      };
      const draft = investDraft(d);
      const autoPost = cur.auto.invest === 'auto';
      set(prev => ({
        deals: prev.deals.filter(x => x.id !== d.id), selId: null, companies: [co, ...prev.companies],
        drafts: autoPost ? prev.drafts : [draft, ...prev.drafts],
        published: autoPost
          ? [{ id: draft.id, typeLabel: draft.typeLabel, companyId: d.id, company: d.name, text: draft.text, site: draft.site, date: 'Just now', channels: draft.channels, auto: true }, ...prev.published]
          : prev.published,
      }));
      toast(autoPost ? `${d.name} added to portfolio and announced automatically.` : `${d.name} added to portfolio. Announcement drafted in Public Presence.`);
      save(async () => {
        const signal = await api.invest(d.rowId);
        await api.createPost(cur.fund.id, draft, d.companyRowId, signal, autoPost);
      });
    };

    /** A short note to the founders of each company, sent once. */
    const checkIn = (ids: string[]) => {
      const cur = ref.current;
      const fresh = ids.filter(id => !cur.checkIns.includes(id));
      if (!fresh.length) return;
      const names = fresh.map(id => cur.companies.find(c => c.id === id)?.name ?? id);
      // Each note mentions the company's last public update, if it has one.
      const list = fresh.flatMap(id => {
        const c = cur.companies.find(x => x.id === id);
        if (!c) return [];
        const last = lastActive(c);
        return [{ rowId: c.rowId, name: c.name, last: c.signals.find(sg => sg.on === last && sg.src !== 'Monitor') }];
      });
      set(prev => ({ checkIns: [...prev.checkIns, ...fresh] }));
      toast(names.length === 1
        ? `A short check-in was sent to the ${names[0]} founders.`
        : `Check-ins sent to ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}, each written from their last public update.`);
      if (list.length) save(() => api.sendCheckIns(cur.fund, list));
    };

    const approve = (id: string) => {
      const cur = ref.current;
      const p = cur.drafts.find(x => x.id === id);
      if (!p) return;
      const text = cur.editing === id ? cur.editText : p.text;
      set(prev => ({
        drafts: prev.drafts.filter(x => x.id !== id), editing: null,
        published: [{ id: p.id, typeLabel: p.typeLabel, companyId: p.companyId, company: p.company, text, site: p.site, date: 'Just now', channels: p.channels, auto: false }, ...prev.published],
      }));
      toast(p.site ? `Published to LinkedIn and ${FUND.domain}.` : 'Published to LinkedIn.');
      save(() => api.publishPost(p.id, text !== p.text ? text : null));
    };

    /** Puts the demo back to its seed, for everyone who has it open, then loads it. */
    const reset = () => {
      window.clearTimeout(timer.current);
      setS(initialState());
      // StrictMode runs the demo route's effect twice. Both calls share one reset.
      if (!resetting.current) {
        const r: Promise<void> = enqueue(api.resetDemo).finally(() => { if (resetting.current === r) resetting.current = null; });
        resetting.current = r;
        r.catch(() => {});
      }
      loading.current = null;
      load();
    };

    return {
      set, toast, go, moveDeal, pass, invest, checkIn, approve, reset, load,
      retry: () => { set({ status: 'loading' }); load(); },
      openDeal: (id: string) => set({ selId: id }),
      closeDeal: () => set({ selId: null }),
      openCompany: (id: string) => set({ view: 'portfolio', coId: id, selId: null }),
      closeCompany: () => set({ coId: null }),
      discard: (id: string) => {
        set(prev => ({ drafts: prev.drafts.filter(x => x.id !== id), editing: null }));
        toast('Draft discarded.');
        save(() => api.discardPost(id));
      },
      toggleEdit: (id: string) => {
        const cur = ref.current;
        if (cur.editing !== id) {
          set({ editing: id, editText: cur.drafts.find(x => x.id === id)?.text ?? '' });
          return;
        }
        const text = cur.editText;
        const changed = cur.drafts.some(x => x.id === id && x.text !== text);
        set(prev => ({ drafts: prev.drafts.map(x => (x.id === id ? { ...x, text } : x)), editing: null }));
        if (changed) save(() => api.editPost(id, text));
      },
      setAuto: (key: AutoKey, v: AutoMode, label: string, optLabel: string) => {
        const fundId = ref.current.fund.id;
        set(prev => ({ auto: { ...prev.auto, [key]: v } }));
        toast(`${label}: ${optLabel.toLowerCase()}.`);
        save(() => api.setAutomation(fundId, key, v));
      },
      toggleChip: (key: 'geos' | 'sectors' | 'stages', label: string) => set(prev => ({ [key]: { ...prev[key], [label]: !prev[key][label] } })),
      saveThesis: () => {
        const cur = ref.current;
        const rubric: Rubric = {
          ...cur.rubric, id: api.newId(), version: cur.rubric.version + 1,
          criteria: cur.rubric.criteria.map(c => ({ ...c, weight: cur.weights[c.key] ?? c.weight })),
          sectors: cur.sectors, stages: cur.stages, geos: cur.geos, threshold: cur.threshold, declineNote: cur.declineNote,
        };
        set({ rubric });
        toast(`Thesis saved. Re-scoring ${(cur.fund.monthScreened - cur.fund.monthPassed).toLocaleString('en-US')} screened applications.`);
        save(() => api.saveRubric(cur.fund.id, rubric));
      },
    };
  }, [set]);

  useEffect(() => { actions.load(); }, [actions]);

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
