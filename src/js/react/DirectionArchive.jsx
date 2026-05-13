import React, { useState, useEffect, useRef, useContext, useCallback, createContext } from 'react';
import { SmartImage } from './SmartImage';
import { LABELS_FR } from './labels';

// --- Themes --------------------------------------------------------------
export const C_THEMES = {
    sepia: {
        kind: 'sepia', label: 'Sépia',
        bg: '#efe8d8', panel: '#e8e0cd', panelAlt: '#ebe3d0',
        ink: '#1c1812', inkSoft: 'rgba(28,24,18,.55)', inkSofter: 'rgba(28,24,18,.35)',
        border: 'rgba(28,24,18,.18)', borderSoft: 'rgba(28,24,18,.08)',
        archive: '#ebe4d4', archiveGrid: 'rgba(40,32,20,.08)',
        overlayBg: 'rgba(28,24,18,.55)', overlayInk: 'rgba(245,238,220,.85)',
        accent: '#1c1812', accentInk: '#efe8d8',
        swatchPreview: 'linear-gradient(135deg,#efe8d8 50%,#1c1812 50%)',
        eraL: 32, eraLOn: 55, eraC: 0.1,
    },
    light: {
        kind: 'light', label: 'Clair',
        bg: '#f7f6f3', panel: '#efeeea', panelAlt: '#ebeae6',
        ink: '#191915', inkSoft: 'rgba(25,25,21,.55)', inkSofter: 'rgba(25,25,21,.32)',
        border: 'rgba(25,25,21,.14)', borderSoft: 'rgba(25,25,21,.06)',
        archive: '#eaeae6', archiveGrid: 'rgba(0,0,0,.06)',
        overlayBg: 'rgba(20,20,18,.55)', overlayInk: 'rgba(255,255,254,.92)',
        accent: '#191915', accentInk: '#f7f6f3',
        swatchPreview: 'linear-gradient(135deg,#f7f6f3 50%,#191915 50%)',
        eraL: 36, eraLOn: 52, eraC: 0.12,
    },
    dark: {
        kind: 'dark', label: 'Sombre',
        bg: '#15130e', panel: '#1d1a14', panelAlt: '#1a1813',
        ink: '#efe8d8', inkSoft: 'rgba(239,232,216,.55)', inkSofter: 'rgba(239,232,216,.32)',
        border: 'rgba(239,232,216,.14)', borderSoft: 'rgba(239,232,216,.06)',
        archive: '#221e17', archiveGrid: 'rgba(239,232,216,.08)',
        overlayBg: 'rgba(239,232,216,.16)', overlayInk: 'rgba(239,232,216,.9)',
        accent: '#efe8d8', accentInk: '#15130e',
        swatchPreview: 'linear-gradient(135deg,#15130e 50%,#efe8d8 50%)',
        eraL: 76, eraLOn: 68, eraC: 0.14,
    },
};
const ThemeC = createContext(C_THEMES.sepia);
const useT = () => useContext(ThemeC);
const eraColor = (T, hue, lMod = 0) => `oklch(${T.eraL + lMod}% ${T.eraC} ${hue})`;
const eraColorOn = (T, hue) => `oklch(${T.eraLOn}% ${T.eraC} ${hue})`;

// --- Container-width hook -----------------------------------------------
function useContainerWidth(ref) {
    const [w, setW] = useState(1280);
    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        setW(el.getBoundingClientRect().width);
        const ro = new ResizeObserver(entries => setW(entries[0].contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return w;
}

// --- Year-range helpers (replace prototype's hardcoded 1957–2025) -------
function computeYearRange(events) {
    if (!events || events.length === 0) return { min: 1900, max: 2025 };
    let min = events[0].date.y, max = events[0].date.y;
    for (const e of events) {
        if (e.date.y < min) min = e.date.y;
        if (e.date.y > max) max = e.date.y;
    }
    const span = Math.max(1, max - min);
    const pad = Math.max(1, Math.round(span * 0.04));
    return { min: min - pad, max: max + pad };
}
function decadeTicks(min, max) {
    const start = Math.ceil(min / 10) * 10;
    const ticks = [];
    for (let y = start; y <= max; y += 10) ticks.push(y);
    return ticks;
}

// --- Leaf components ----------------------------------------------------
function Bracket({ corner }) {
    const T = useT();
    const pos = {
        tl: { left: 10, top: 10, borderLeft: '1px solid', borderTop: '1px solid' },
        tr: { right: 10, top: 10, borderRight: '1px solid', borderTop: '1px solid' },
        bl: { left: 10, bottom: 10, borderLeft: '1px solid', borderBottom: '1px solid' },
        br: { right: 10, bottom: 10, borderRight: '1px solid', borderBottom: '1px solid' },
    }[corner];
    return (
        <div style={{
            position: 'absolute', width: 12, height: 12,
            borderColor: T.kind === 'dark' ? 'rgba(239,232,216,.4)' : 'rgba(40,32,20,.5)',
            ...pos,
        }} />
    );
}

function ArchiveMedia({ kind, id, image, credit, wiki, labels }) {
    const T = useT();
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: T.archive,
            overflow: 'hidden',
            borderTop: `1px solid ${T.border}`,
            borderBottom: `1px solid ${T.border}`,
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage:
                    `linear-gradient(${T.archiveGrid} 1px, transparent 1px),` +
                    `linear-gradient(90deg, ${T.archiveGrid} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
            }} />
            <SmartImage src={image} wiki={wiki} alt={credit} fit="cover"
                style={{ filter: T.kind === 'dark' ? 'saturate(.8) contrast(1)' : 'saturate(.85) contrast(1.02)' }} />
            {(image || wiki) && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: T.kind === 'sepia'
                        ? 'linear-gradient(180deg, rgba(89,67,30,.10) 0%, rgba(89,67,30,.04) 50%, rgba(89,67,30,.18) 100%)'
                        : T.kind === 'dark'
                            ? 'linear-gradient(180deg, rgba(0,0,0,.1) 0%, transparent 50%, rgba(0,0,0,.35) 100%)'
                            : 'linear-gradient(180deg, rgba(0,0,0,.04) 0%, transparent 50%, rgba(0,0,0,.12) 100%)',
                    mixBlendMode: T.kind === 'sepia' ? 'multiply' : 'normal',
                    pointerEvents: 'none',
                }} />
            )}
            <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                height: 1, background: T.border, mixBlendMode: 'multiply',
            }} />
            <div style={{
                position: 'absolute', top: 0, bottom: 0, left: '50%',
                width: 1, background: T.border, mixBlendMode: 'multiply',
            }} />
            {['tl', 'tr', 'bl', 'br'].map(c => (<Bracket key={c} corner={c} />))}
            <div style={{
                position: 'absolute', left: 16, bottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                letterSpacing: '.08em', textTransform: 'uppercase',
                color: T.overlayInk,
                padding: '3px 6px',
                background: T.overlayBg,
                backdropFilter: 'blur(2px)',
            }}>
                <div style={{ width: 36, height: 2, background: T.overlayInk }} />
                <span>{labels.sample} · {id}</span>
            </div>
            <div style={{
                position: 'absolute', right: 16, top: 16,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                letterSpacing: '.08em', textTransform: 'uppercase',
                color: T.overlayInk,
                padding: '3px 6px',
                background: T.overlayBg,
                backdropFilter: 'blur(2px)',
            }}>
                {labels.figureLabel} {String(id.length).padStart(2, '0')} · {kind}
            </div>
        </div>
    );
}

function Field({ label, value, mono, hue }) {
    const T = useT();
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: T.inkSoft,
                marginBottom: 3,
            }}>{label}</div>
            <div style={{
                fontFamily: mono ? 'JetBrains Mono, monospace' : '"Inter Tight", system-ui, sans-serif',
                fontSize: 13,
                color: hue != null ? eraColor(T, hue) : T.ink,
                fontWeight: 500,
                wordBreak: 'break-word',
            }}>{value}</div>
        </div>
    );
}

function archiveNavBtn(T, disabled) {
    return {
        width: '100%',
        padding: '8px 10px',
        background: disabled ? 'transparent' : T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: 2,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '.04em',
        color: disabled ? T.inkSofter : T.ink,
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background .15s',
    };
}

// --- Main component -----------------------------------------------------
/**
 * Archive direction — research/database viewer.
 * @param {object} props
 * @param {object} props.data - { title, eras, events } produced by adaptTimelineConfig
 * @param {boolean} [props.standalone=false] - enable URL hash routing and persistent theme
 * @param {number} [props.initialIdx=0]
 * @param {'sepia'|'light'|'dark'} [props.defaultTheme='sepia']
 */
export function DirectionArchive({ data, standalone = false, initialIdx = 0, defaultTheme = 'sepia', labels: labelsProp }) {
    if (!data || !data.events || data.events.length === 0) return null;
    const labels = labelsProp || LABELS_FR.archive;
    const events = data.events;

    const rootRef = useRef(null);
    const width = useContainerWidth(rootRef);
    const isMobile = width > 0 && width < 720;

    // Theme (persisted in standalone mode)
    const [theme, setTheme] = useState(() => {
        if (standalone && typeof localStorage !== 'undefined') {
            return localStorage.getItem('c-theme') || defaultTheme;
        }
        return defaultTheme;
    });
    const T = C_THEMES[theme] || C_THEMES.sepia;
    useEffect(() => {
        if (!standalone) return;
        try { localStorage.setItem('c-theme', theme); } catch (_) { /* no-op */ }
    }, [theme, standalone]);

    // idx, optionally hydrated from URL hash
    const safeInitial = Math.max(0, Math.min(initialIdx, events.length - 1));
    const [idx, setIdx] = useState(() => {
        if (standalone && typeof window !== 'undefined' && window.location.hash) {
            const hashId = decodeURIComponent(window.location.hash.slice(1));
            const i = events.findIndex(e => e.id === hashId);
            if (i >= 0) return i;
        }
        return safeInitial;
    });
    useEffect(() => {
        if (!standalone) return;
        const id = events[idx]?.id;
        if (id && window.location.hash.slice(1) !== id) {
            try { history.replaceState(null, '', `#${id}`); } catch (_) { /* no-op */ }
        }
    }, [idx, standalone, events]);
    useEffect(() => {
        if (!standalone) return;
        const onHash = () => {
            const hashId = decodeURIComponent(window.location.hash.slice(1));
            const i = events.findIndex(e => e.id === hashId);
            if (i >= 0) setIdx(i);
        };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, [standalone, events]);

    const ev = events[idx];
    const era = data.eras.find(e => e.id === ev.era) || { id: 'fallback', label: '—', hue: 0 };

    // Filters
    const [filterText, setFilterText] = useState('');
    const [filterEras, setFilterEras] = useState(() => new Set());
    const [density, setDensity] = useState('normal');
    const norm = (s) => s.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const matchesFilter = (e) => {
        if (filterEras.size && !filterEras.has(e.era)) return false;
        if (filterText.trim()) {
            const q = norm(filterText);
            const hay = norm(`${e.headline} ${e.kicker} ${e.text} ${e.country} ${e.tag} ${e.date.y}`);
            if (!hay.includes(q)) return false;
        }
        return true;
    };
    const filteredCount = events.filter(matchesFilter).length;
    const D = {
        compact: { itemPad: '6px 18px', headline: 11.5, year: 10, yearCol: 40, gap: 8 },
        normal:  { itemPad: '10px 20px', headline: 13.5, year: 11, yearCol: 48, gap: 10 },
        ample:   { itemPad: '14px 22px', headline: 15, year: 12, yearCol: 56, gap: 12 },
    }[density];

    const { min: yearMin, max: yearMax } = computeYearRange(events);
    const ticks = decadeTicks(yearMin, yearMax);
    const yearToPct = y => ((y - yearMin) / Math.max(1, yearMax - yearMin)) * 100;

    const toggleEra = (id) => setFilterEras(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const clearFilters = () => { setFilterText(''); setFilterEras(new Set()); };

    // Auto-scroll list when idx changes
    const listRef = useRef(null);
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-event="${ev.id}"]`);
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [idx]);

    // Mobile tab
    const [mobileTab, setMobileTab] = useState('fiche');

    // Search input ref for "/" shortcut
    const searchRef = useRef(null);

    // Keyboard nav — scoped to hover (or always in standalone)
    const [hovered, setHovered] = useState(false);
    useEffect(() => {
        if (!hovered && !standalone) return;
        const onKey = (e) => {
            const tgt = e.target;
            if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) {
                if (e.code === 'Escape' && tgt === searchRef.current) tgt.blur();
                return;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyJ') {
                e.preventDefault(); setIdx(i => Math.min(events.length - 1, i + 1));
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyK') {
                e.preventDefault(); setIdx(i => Math.max(0, i - 1));
            } else if (e.code === 'Slash') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [hovered, standalone, events.length]);

    // Copy link
    const [copyState, setCopyState] = useState(null);
    const copyLink = useCallback(() => {
        const id = ev.id;
        let url;
        if (standalone) {
            url = `${window.location.origin}${window.location.pathname}#${id}`;
        } else {
            url = `#${id}`;
        }
        const fallback = () => {
            try {
                const ta = document.createElement('textarea');
                ta.value = url; document.body.appendChild(ta);
                ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            } catch (_) { /* no-op */ }
        };
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url).then(
                () => { setCopyState('ok'); setTimeout(() => setCopyState(null), 1600); },
                () => { fallback(); setCopyState('ok'); setTimeout(() => setCopyState(null), 1600); }
            );
        } else { fallback(); setCopyState('ok'); setTimeout(() => setCopyState(null), 1600); }
    }, [ev, standalone]);

    const ctx = {
        T, data, events, ev, era, idx, setIdx, isMobile, labels,
        filterText, setFilterText, filterEras, toggleEra, clearFilters, searchRef,
        matchesFilter, filteredCount,
        density, setDensity, D,
        theme, setTheme,
        yearToPct, ticks, yearMin, yearMax, listRef,
        copyState, copyLink, standalone,
        mobileTab, setMobileTab,
    };

    return (
        <ThemeC.Provider value={T}>
            <style>{`
                .c-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
                .c-scroll::-webkit-scrollbar-track { background: transparent; }
                .c-scroll::-webkit-scrollbar-thumb {
                    background: ${T.inkSofter};
                    border-radius: 999px;
                    border: 3px solid ${T.panel};
                    background-clip: padding-box;
                }
                .c-scroll::-webkit-scrollbar-thumb:hover { background: ${T.inkSoft}; background-clip: padding-box; border: 3px solid ${T.panel}; }
                .c-scroll::-webkit-scrollbar-corner { background: ${T.panel}; }
                .c-scroll { scrollbar-color: ${T.inkSofter} transparent; scrollbar-width: thin; }
                .c-scroll-bg::-webkit-scrollbar-thumb { border-color: ${T.bg}; }
                .c-scroll-bg::-webkit-scrollbar-thumb:hover { border-color: ${T.bg}; }
                .c-scroll-bg::-webkit-scrollbar-corner { background: ${T.bg}; }
                @keyframes c-soft-in {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div
                ref={rootRef}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: 'absolute', inset: 0,
                    background: T.bg,
                    color: T.ink,
                    fontFamily: '"Inter Tight", system-ui, sans-serif',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'background .25s, color .25s',
                }}
            >
                {isMobile ? <CMobile ctx={ctx} /> : <CDesktop ctx={ctx} />}
            </div>
        </ThemeC.Provider>
    );
}

// --- Top header (shared) -----------------------------------------------
function CHeader({ ctx }) {
    const { T, events, ev, idx, filteredCount, density, setDensity, theme, setTheme, isMobile, yearMin, yearMax, labels } = ctx;
    return (
        <header style={{
            flex: '0 0 auto',
            padding: isMobile ? '12px 16px' : '16px 28px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
            background: T.panel,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '.06em', flexWrap: 'wrap',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, minWidth: 0 }}>
                <span style={{
                    textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 600,
                }}>{labels.title}</span>
                {!isMobile && (
                    <span style={{ color: T.inkSoft }}>
                        {labels.corpus} · {filteredCount === events.length ? `${events.length} ${labels.entries}` : `${filteredCount} / ${events.length} ${labels.entries}`} · {yearMin}–{yearMax}
                    </span>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 18, flexWrap: 'wrap' }}>
                <ThemePicker T={T} theme={theme} setTheme={setTheme} compact={isMobile} labels={labels} />
                <DensityPicker T={T} density={density} setDensity={setDensity} labels={labels} />
                {!isMobile && (
                    <div style={{ color: T.inkSoft }}>
                        {labels.fiche} {String(idx + 1).padStart(3, '0')} · {labels.ref} {ev.id.toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}

function DensityPicker({ T, density, setDensity, labels }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: T.inkSofter, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase' }}>{labels.densityLabel}</span>
            <div style={{ display: 'inline-flex', border: `1px solid ${T.border}`, borderRadius: 2, overflow: 'hidden' }}>
                {[['compact', '·'], ['normal', '· ·'], ['ample', '· · ·']].map(([k, glyph]) => (
                    <button key={k} onClick={() => setDensity(k)} title={k} style={{
                        padding: '4px 9px',
                        background: density === k ? T.accent : 'transparent',
                        color: density === k ? T.accentInk : T.inkSoft,
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        letterSpacing: '0.06em',
                        transition: 'background .15s, color .15s',
                    }}>{glyph}</button>
                ))}
            </div>
        </div>
    );
}

function ThemePicker({ T, theme, setTheme, compact, labels }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!compact && (
                <span style={{ color: T.inkSofter, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase' }}>{labels.themeLabel}</span>
            )}
            <div style={{ display: 'inline-flex', border: `1px solid ${T.border}`, borderRadius: 2, overflow: 'hidden' }}>
                {Object.entries(C_THEMES).map(([k, t]) => (
                    <button key={k} onClick={() => setTheme(k)} title={labels.themes[k] || t.label} style={{
                        padding: '3px 6px',
                        background: theme === k ? T.accent : 'transparent',
                        border: 'none', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center',
                        transition: 'background .15s',
                    }}>
                        <span style={{
                            width: 14, height: 14, borderRadius: 2,
                            background: t.swatchPreview,
                            border: `1px solid ${theme === k ? T.accentInk : T.border}`,
                            display: 'inline-block',
                        }} />
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- Mini-map (shared) -------------------------------------------------
function CMinimap({ ctx }) {
    const { T, data, events, ev, idx, setIdx, matchesFilter, yearToPct, ticks, isMobile } = ctx;
    return (
        <div style={{
            flex: '0 0 auto',
            position: 'relative', height: 38,
            padding: isMobile ? '8px 16px' : '8px 28px',
            borderBottom: `1px solid ${T.border}`,
            background: T.panelAlt,
        }}>
            <div style={{ position: 'relative', height: 22 }}>
                {data.eras.map(e => (
                    <div key={e.id} style={{
                        position: 'absolute',
                        left: `${yearToPct(e.start)}%`,
                        width: `${yearToPct(e.end) - yearToPct(e.start)}%`,
                        top: 8, height: 2,
                        background: eraColorOn(T, e.hue),
                        opacity: .55,
                    }} />
                ))}
                {ticks.map(y => (
                    <span key={y} style={{
                        position: 'absolute', left: `${yearToPct(y)}%`,
                        top: 14, transform: 'translateX(-50%)',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                        letterSpacing: '.06em', color: T.inkSofter,
                    }}>{y}</span>
                ))}
                {events.map((e, i) => {
                    const active = i === idx;
                    const matches = matchesFilter(e);
                    return (
                        <button
                            key={e.id}
                            onClick={() => setIdx(i)}
                            title={e.headline}
                            style={{
                                position: 'absolute',
                                left: `${yearToPct(e.date.y)}%`,
                                top: active ? 4 : 6, transform: 'translateX(-50%)',
                                width: active ? 2 : 1, height: active ? 10 : 6,
                                background: active ? T.ink : T.inkSofter,
                                opacity: matches ? 1 : 0.18,
                                border: 'none', padding: 0, cursor: 'pointer',
                                transition: 'all .35s cubic-bezier(.2,.7,.3,1)',
                            }}
                        />
                    );
                })}
                <div style={{
                    position: 'absolute',
                    left: `${yearToPct(ev.date.y)}%`,
                    top: 2, transform: 'translateX(-50%)',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                    color: T.ink, fontWeight: 600,
                    transition: 'left .55s cubic-bezier(.2,.7,.3,1)',
                }}>↓</div>
            </div>
        </div>
    );
}

// --- Filter UI (used in both layouts) ----------------------------------
function CFilters({ ctx }) {
    const { T, data, filterText, setFilterText, filterEras, toggleEra, clearFilters, searchRef, labels } = ctx;
    return (
        <div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
                <span style={{
                    position: 'absolute', left: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                    color: T.inkSofter, pointerEvents: 'none',
                }}>⌕</span>
                <input
                    ref={searchRef}
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder={labels.searchPlaceholder}
                    style={{
                        width: '100%',
                        padding: '6px 24px 6px 22px',
                        background: T.bg,
                        border: `1px solid ${T.border}`,
                        borderRadius: 2,
                        fontFamily: '"Inter Tight", system-ui, sans-serif',
                        fontSize: 12,
                        color: T.ink, outline: 'none', boxSizing: 'border-box',
                    }}
                />
                {filterText && (
                    <button onClick={() => setFilterText('')} style={{
                        position: 'absolute', right: 4, top: '50%',
                        transform: 'translateY(-50%)',
                        width: 18, height: 18, borderRadius: 2,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: T.inkSoft,
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {data.eras.map(e => {
                    const on = filterEras.has(e.id);
                    return (
                        <button
                            key={e.id}
                            onClick={() => toggleEra(e.id)}
                            style={{
                                padding: '3px 8px',
                                background: on ? eraColorOn(T, e.hue) : 'transparent',
                                color: on ? T.bg : eraColor(T, e.hue),
                                border: `1px solid ${on ? eraColorOn(T, e.hue) : eraColor(T, e.hue, 40)}`,
                                borderRadius: 2,
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5,
                                letterSpacing: '.05em', textTransform: 'uppercase',
                                cursor: 'pointer', transition: 'all .15s',
                            }}
                        >{e.label}</button>
                    );
                })}
                {(filterEras.size > 0 || filterText) && (
                    <button onClick={clearFilters} style={{
                        padding: '3px 8px',
                        background: 'transparent',
                        border: `1px dashed ${T.inkSofter}`,
                        color: T.inkSoft,
                        borderRadius: 2,
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5,
                        letterSpacing: '.05em', textTransform: 'uppercase',
                        cursor: 'pointer',
                    }}>{labels.reset}</button>
                )}
            </div>
        </div>
    );
}

// --- Index list (used in both layouts) ---------------------------------
function CIndexList({ ctx, onPick }) {
    const { T, data, events, idx, setIdx, matchesFilter, filteredCount, D, clearFilters, labels } = ctx;
    return (
        <>
            <div style={{
                padding: '12px 20px 8px',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: T.inkSoft,
                display: 'flex', justifyContent: 'space-between',
            }}>
                <span>{labels.indexHeading}</span>
                <span style={{ color: T.inkSofter }}>{filteredCount}</span>
            </div>
            {events.map((e, i) => {
                const active = i === idx;
                const matches = matchesFilter(e);
                const eraObj = data.eras.find(er => er.id === e.era) || { hue: 0 };
                return (
                    <button
                        key={e.id}
                        data-event={e.id}
                        onClick={() => { setIdx(i); onPick && onPick(); }}
                        style={{
                            display: matches ? 'grid' : 'none',
                            gridTemplateColumns: `${D.yearCol}px 1fr`,
                            gap: D.gap,
                            width: '100%',
                            padding: D.itemPad,
                            background: active ? T.accent : 'transparent',
                            color: active ? T.accentInk : T.ink,
                            border: 'none',
                            borderTop: `1px solid ${T.borderSoft}`,
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background .15s, padding .2s',
                            alignItems: 'baseline',
                        }}
                    >
                        <span style={{
                            fontFamily: 'JetBrains Mono, monospace', fontSize: D.year,
                            fontWeight: 600,
                            color: active ? eraColor(T, eraObj.hue, T.kind === 'dark' ? 0 : 40) : eraColor(T, eraObj.hue),
                            letterSpacing: '.04em',
                        }}>{e.date.y}</span>
                        <span style={{
                            fontFamily: '"Newsreader", Georgia, serif',
                            fontSize: D.headline, lineHeight: 1.25,
                            fontWeight: active ? 500 : 400, textWrap: 'pretty',
                        }}>{e.headline}</span>
                    </button>
                );
            })}
            {filteredCount === 0 && (
                <div style={{
                    padding: '24px 20px',
                    fontFamily: '"Newsreader", Georgia, serif',
                    fontStyle: 'italic', fontSize: 13,
                    color: T.inkSoft, textWrap: 'pretty',
                }}>
                    {labels.noResultsBefore}
                    <button onClick={clearFilters} style={{
                        background: 'transparent', border: 'none', padding: 0,
                        color: T.ink, fontStyle: 'italic',
                        fontFamily: 'inherit', fontSize: 'inherit',
                        textDecoration: 'underline', cursor: 'pointer',
                    }}>{labels.reset}</button>{labels.noResultsAfter}
                </div>
            )}
        </>
    );
}

// --- Fiche (center detail, used in both layouts) -----------------------
function CFiche({ ctx }) {
    const { T, ev, era, idx, isMobile, labels } = ctx;
    return (
        <section className="c-scroll c-scroll-bg" style={{
            display: 'flex', flexDirection: 'column',
            minHeight: 0, overflow: isMobile ? 'auto' : 'hidden',
            background: T.bg,
        }}>
            <div key={`media-${idx}`} style={{
                flex: isMobile ? '0 0 auto' : '1 1 auto',
                position: 'relative',
                minHeight: isMobile ? 220 : 0,
                margin: isMobile ? '12px 16px' : '20px 24px 16px',
                animation: 'c-soft-in 480ms cubic-bezier(.2,.7,.3,1) both',
            }}>
                <ArchiveMedia kind={ev.mediaKind} id={ev.id} image={ev.image} credit={ev.credit} wiki={ev.wiki} labels={labels} />
            </div>
            <div key={`text-${idx}`} style={{
                padding: isMobile ? '0 16px 24px' : '0 24px 24px',
                animation: 'c-soft-in 520ms cubic-bezier(.2,.7,.3,1) both 80ms',
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: isMobile ? 20 : 24,
                        fontWeight: 700, letterSpacing: '-.01em', color: T.ink,
                    }}>
                        {ev.date.y}<span style={{ color: T.inkSofter }}>.{String(ev.date.m).padStart(2, '0')}.{String(ev.date.d).padStart(2, '0')}</span>
                    </span>
                    <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                        letterSpacing: '.12em', textTransform: 'uppercase',
                        padding: '3px 7px',
                        background: T.kind === 'dark' ? eraColor(T, era.hue, -30) : `oklch(85% 0.07 ${era.hue})`,
                        color: T.kind === 'dark' ? eraColor(T, era.hue, 10) : `oklch(28% 0.08 ${era.hue})`,
                        borderRadius: 2,
                    }}>{era.label}</span>
                </div>
                <h1 style={{
                    fontFamily: '"Newsreader", Georgia, serif',
                    fontWeight: 500, fontSize: isMobile ? 22 : 28, lineHeight: 1.1,
                    letterSpacing: '-.01em', margin: '0 0 6px', textWrap: 'balance',
                }}>{ev.headline}</h1>
                {ev.kicker && (
                    <p style={{
                        fontFamily: '"Newsreader", Georgia, serif',
                        fontStyle: 'italic', fontSize: isMobile ? 13.5 : 14.5, lineHeight: 1.4,
                        color: T.inkSoft, margin: '0 0 10px',
                    }}>{ev.kicker}</p>
                )}
                <p style={{
                    fontSize: isMobile ? 13 : 13.5, lineHeight: 1.55,
                    color: T.ink, margin: 0, textWrap: 'pretty', opacity: .85,
                }}>{ev.text}</p>
            </div>
        </section>
    );
}

// --- Metadata sidebar (used in both layouts) ---------------------------
function CMeta({ ctx }) {
    const { T, ev, era, events, idx, setIdx, copyState, copyLink, isMobile, labels } = ctx;
    return (
        <aside className="c-scroll" style={{
            borderLeft: isMobile ? 'none' : `1px solid ${T.border}`,
            background: T.panel,
            padding: isMobile ? '16px' : '20px 22px',
            overflow: 'auto', minHeight: 0,
            fontSize: 12,
        }}>
            <div key={`fields-${idx}`} style={{
                animation: 'c-soft-in 480ms cubic-bezier(.2,.7,.3,1) both',
            }}>
                <Field label={labels.fieldReference} value={ev.id.toUpperCase()} mono />
                <Field label={labels.fieldDate} value={ev.date.display} />
                {ev.country && <Field label={labels.fieldCountry} value={ev.country} />}
                <Field label={labels.fieldCategory} value={ev.tag} />
                <Field label={labels.fieldEra} value={era.label} hue={era.hue} />
                <Field label={labels.fieldCredit} value={ev.credit || '—'} />

                {ev.mediaCaption && (
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                        <div style={{
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                            letterSpacing: '.18em', textTransform: 'uppercase',
                            color: T.inkSoft, marginBottom: 8,
                        }}>{labels.captionLabel}</div>
                        <p style={{
                            fontFamily: '"Newsreader", Georgia, serif',
                            fontStyle: 'italic', fontSize: 12, lineHeight: 1.45,
                            color: T.ink, margin: 0, opacity: .85,
                        }}>{ev.mediaCaption}</p>
                    </div>
                )}

                <div style={{ marginTop: 16 }}>
                    <button onClick={copyLink} style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: copyState === 'ok' ? T.accent : 'transparent',
                        color: copyState === 'ok' ? T.accentInk : T.ink,
                        border: `1px solid ${T.border}`,
                        borderRadius: 2,
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                        letterSpacing: '.08em', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'background .2s, color .2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        {copyState === 'ok' ? labels.copyDone : labels.copyLink}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                    letterSpacing: '.18em', textTransform: 'uppercase',
                    color: T.inkSoft, marginBottom: 10,
                }}>{labels.navigation}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} style={archiveNavBtn(T, idx === 0)}>
                        ← {events[idx - 1]?.date.y || '—'} · {events[idx - 1]?.headline.split(' ').slice(0, 2).join(' ') || '—'}
                    </button>
                    <button disabled={idx === events.length - 1} onClick={() => setIdx(idx + 1)} style={archiveNavBtn(T, idx === events.length - 1)}>
                        {events[idx + 1]?.date.y || '—'} · {events[idx + 1]?.headline.split(' ').slice(0, 2).join(' ') || '—'} →
                    </button>
                </div>
                <div style={{
                    marginTop: 10,
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                    letterSpacing: '.12em', color: T.inkSofter,
                }}>
                    {labels.shortcutsPrefix}<kbd style={kbdStyle(T)}>←</kbd> <kbd style={kbdStyle(T)}>→</kbd>{labels.shortcutNav}<kbd style={kbdStyle(T)}>/</kbd>{labels.shortcutSearch}
                </div>
            </div>
        </aside>
    );
}

function kbdStyle(T) {
    return {
        display: 'inline-block', padding: '0 4px', margin: '0 1px',
        background: T.bg, border: `1px solid ${T.border}`, borderRadius: 2,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
    };
}

// --- Desktop layout ----------------------------------------------------
function CDesktop({ ctx }) {
    const { T, listRef } = ctx;
    return (
        <>
            <CHeader ctx={ctx} />
            <CMinimap ctx={ctx} />
            <main style={{
                flex: '1 1 auto',
                display: 'grid',
                gridTemplateColumns: '260px 1fr 260px',
                minHeight: 0,
            }}>
                <aside ref={listRef} className="c-scroll" style={{
                    borderRight: `1px solid ${T.border}`,
                    background: T.panel,
                    overflow: 'auto', minHeight: 0,
                    padding: 0, paddingBottom: 12,
                }}>
                    <div style={{
                        position: 'sticky', top: 0, zIndex: 2,
                        background: T.panel,
                        borderBottom: `1px solid ${T.borderSoft}`,
                        padding: '10px 16px 12px',
                    }}>
                        <CFilters ctx={ctx} />
                    </div>
                    <CIndexList ctx={ctx} />
                </aside>
                <CFiche ctx={ctx} />
                <CMeta ctx={ctx} />
            </main>
        </>
    );
}

// --- Mobile layout -----------------------------------------------------
function CMobile({ ctx }) {
    const { T, mobileTab, setMobileTab, listRef, filteredCount, labels } = ctx;

    const tabs = [
        { id: 'fiche', label: labels.mobileTabs.fiche },
        { id: 'index', label: `${labels.mobileTabs.index} · ${filteredCount}` },
        { id: 'meta',  label: labels.mobileTabs.meta },
    ];

    return (
        <>
            <CHeader ctx={ctx} />
            <CMinimap ctx={ctx} />
            <div style={{
                flex: '0 0 auto',
                display: 'flex',
                borderBottom: `1px solid ${T.border}`,
                background: T.panelAlt,
            }}>
                {tabs.map(t => {
                    const on = mobileTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setMobileTab(t.id)}
                            style={{
                                flex: 1,
                                padding: '10px 8px',
                                background: on ? T.bg : 'transparent',
                                color: on ? T.ink : T.inkSoft,
                                border: 'none',
                                borderBottom: on ? `2px solid ${T.ink}` : '2px solid transparent',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                letterSpacing: '.16em', textTransform: 'uppercase',
                                cursor: 'pointer', transition: 'background .15s, color .15s',
                            }}
                        >{t.label}</button>
                    );
                })}
            </div>
            <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {mobileTab === 'fiche' && <CFiche ctx={ctx} />}
                {mobileTab === 'index' && (
                    <div ref={listRef} className="c-scroll" style={{ overflow: 'auto', minHeight: 0, background: T.panel, paddingBottom: 12 }}>
                        <div style={{
                            position: 'sticky', top: 0, zIndex: 2,
                            background: T.panel,
                            borderBottom: `1px solid ${T.borderSoft}`,
                            padding: '10px 16px 12px',
                        }}>
                            <CFilters ctx={ctx} />
                        </div>
                        <CIndexList ctx={ctx} onPick={() => setMobileTab('fiche')} />
                    </div>
                )}
                {mobileTab === 'meta' && (
                    <div className="c-scroll" style={{ overflow: 'auto', minHeight: 0 }}>
                        <CMeta ctx={ctx} />
                    </div>
                )}
            </div>
        </>
    );
}
