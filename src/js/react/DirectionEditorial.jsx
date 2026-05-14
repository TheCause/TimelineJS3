import React, { useState } from 'react';
import { SmartImage } from './SmartImage';
import { useSlideLayers, computeYearRange, decadeTicks } from './hooks';
import { LABELS_FR } from './labels';

function eraColor(hue, l = 70, c = 0.08) {
    return `oklch(${l}% ${c} ${hue})`;
}

function EditorialMedia({ kind, caption, id, image, credit, wiki }) {
    const tone = {
        satellite: ['#2a2722', '#5a5044'],
        portrait:  ['#3a2a1f', '#6b4e38'],
        lunar:     ['#1a1a1d', '#4a4a52'],
        probe:     ['#22241a', '#4a503a'],
        shuttle:   ['#1f2a3a', '#3e556e'],
        smoke:     ['#2c2724', '#7a7066'],
        stars:     ['#0f1224', '#2e3458'],
        station:   ['#1c2228', '#3c4a55'],
        mars:      ['#3a1a10', '#7a3a20'],
        rover:     ['#2d1e16', '#5a3e2c'],
        pluto:     ['#1a1418', '#4a3a44'],
        launch:    ['#181818', '#5a5044'],
        telescope: ['#1a1614', '#5a4830'],
        orion:     ['#101418', '#3a4658'],
        image:     ['#2a2722', '#5a5044'],
        embed:     ['#2a2722', '#5a5044'],
        archive:   ['#2c2724', '#7a7066'],
        map:       ['#1f2a3a', '#3e556e'],
        audio:     ['#1a1418', '#4a3a44'],
        quote:     ['#3a2a1f', '#6b4e38'],
    }[kind] || ['#2a2722', '#5a5044'];

    return (
        <figure style={{
            position: 'absolute', inset: 0, margin: 0,
            background: `linear-gradient(135deg, ${tone[0]} 0%, ${tone[1]} 100%)`,
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage:
                    'repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px)',
                mixBlendMode: 'overlay',
            }} />
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(48%, 280px)', aspectRatio: '1 / 1',
                borderRadius: kind === 'satellite' || kind === 'pluto' || kind === 'lunar' || kind === 'orion' ? '50%' : '2px',
                background: `radial-gradient(circle at 30% 30%, ${tone[1]} 0%, ${tone[0]} 80%)`,
                boxShadow: 'inset 0 0 60px rgba(0,0,0,.4), 0 20px 60px rgba(0,0,0,.3)',
            }} />
            <SmartImage src={image} wiki={wiki} alt={caption} />
            <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%',
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,.5) 100%)',
                pointerEvents: 'none',
            }} />
            <figcaption style={{
                position: 'absolute', left: 20, right: 20, bottom: 16,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,.78)',
                display: 'flex', justifyContent: 'space-between', gap: 16,
            }}>
                <span>{credit || `${id} · placeholder`}</span>
                <span style={{ textAlign: 'right', maxWidth: '60%', textTransform: 'none', letterSpacing: 0, opacity: .85 }}>{caption}</span>
            </figcaption>
        </figure>
    );
}

/**
 * Editorial direction — magazine spread aesthetic.
 */
export function DirectionEditorial({ data, initialIdx = 0, labels: labelsProp }) {
    if (!data || !data.events || data.events.length === 0) return null;
    const labels = labelsProp || LABELS_FR.editorial;
    const events = data.events;
    const safeInitial = Math.max(0, Math.min(initialIdx, events.length - 1));
    const [idx, setIdx] = useState(safeInitial);
    const ev = events[idx];
    const era = data.eras.find(e => e.id === ev.era) || { id: 'fallback', label: '—', hue: 0 };
    const layers = useSlideLayers(idx, 620);

    const { min: yearMin, max: yearMax } = computeYearRange(events);
    const range = Math.max(1, yearMax - yearMin);
    const yearToPct = y => ((y - yearMin) / range) * 100;
    const ticks = decadeTicks(yearMin, yearMax);

    const titleHeadline = data.title?.headline || '';
    const titleSubhead = data.title?.subhead || '';
    const titleDate = data.title?.date || `${yearMin} — ${yearMax}`;

    return (
        <>
            <style>{`
                @keyframes a-in-forward {
                    from { opacity: 0; transform: translateX(36px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes a-in-back {
                    from { opacity: 0; transform: translateX(-36px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes a-out-forward {
                    from { opacity: 1; transform: translateX(0); }
                    to   { opacity: 0; transform: translateX(-36px); }
                }
                @keyframes a-out-back {
                    from { opacity: 1; transform: translateX(0); }
                    to   { opacity: 0; transform: translateX(36px); }
                }
                @keyframes a-text-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div style={{
                position: 'absolute', inset: 0,
                background: '#f5efe5',
                color: '#1a1814',
                fontFamily: '"Inter Tight", Inter, system-ui, sans-serif',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>
                <header className="tl-topbar" style={{
                    flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    padding: '24px 40px 20px',
                    borderBottom: '1px solid rgba(26,24,20,.12)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, minWidth: 0, flexWrap: 'wrap' }}>
                        {titleHeadline && (
                            <span style={{
                                fontFamily: 'Newsreader, Georgia, serif',
                                fontStyle: 'italic', fontWeight: 500, fontSize: 22, letterSpacing: '-.01em',
                            }}>{titleHeadline}</span>
                        )}
                        {titleSubhead && (
                            <span style={{
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                                letterSpacing: '.08em', textTransform: 'uppercase',
                                color: 'rgba(26,24,20,.55)',
                            }}>· {titleSubhead}</span>
                        )}
                    </div>
                    <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        letterSpacing: '.08em', textTransform: 'uppercase',
                        color: 'rgba(26,24,20,.55)',
                    }}>
                        {String(idx + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')} — {titleDate}
                    </div>
                </header>

                <main style={{
                    flex: '1 1 auto', position: 'relative',
                    minHeight: 0, overflow: 'hidden',
                }}>
                    {layers.map((layer, li) => {
                        const lev = events[layer.val];
                        const lera = data.eras.find(e => e.id === lev.era) || { hue: 0, label: '—' };
                        const isTop = li === layers.length - 1;
                        const dir = layer.dir;
                        const anim = isTop
                            ? (dir === 0 ? 'none' : (dir === 1 ? 'a-in-forward' : 'a-in-back'))
                            : (dir === 1 ? 'a-out-forward' : 'a-out-back');
                        return (
                            <div key={layer.id} style={{
                                position: 'absolute', inset: 0,
                                display: 'grid', gridTemplateColumns: '1.15fr 1fr',
                                animation: anim === 'none' ? 'none' : `${anim} 620ms cubic-bezier(.2,.7,.3,1) both`,
                                pointerEvents: isTop ? 'auto' : 'none',
                            }}>
                                <div style={{ position: 'relative', borderRight: '1px solid rgba(26,24,20,.12)' }}>
                                    <EditorialMedia kind={lev.mediaKind} caption={lev.mediaCaption} id={lev.id} image={lev.image} credit={lev.credit} wiki={lev.wiki} />
                                    <div style={{
                                        position: 'absolute', top: 24, left: 24,
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '6px 10px',
                                        background: 'rgba(245,239,229,.92)',
                                        borderRadius: 2,
                                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                        letterSpacing: '.1em', textTransform: 'uppercase',
                                        color: '#1a1814',
                                    }}>
                                        <span style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: eraColor(lera.hue, 55, 0.12),
                                        }} />
                                        {lera.label}
                                    </div>
                                </div>

                                <article style={{
                                    padding: '40px 48px 32px',
                                    display: 'flex', flexDirection: 'column',
                                    minHeight: 0, overflow: 'hidden',
                                    background: '#f5efe5',
                                }}>
                                    <div style={{
                                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                                        letterSpacing: '.1em', textTransform: 'uppercase',
                                        color: eraColor(lera.hue, 40, 0.14),
                                        marginBottom: 16,
                                        animation: isTop && dir !== 0 ? 'a-text-in 700ms cubic-bezier(.2,.7,.3,1) both 80ms' : 'none',
                                    }}>
                                        {lev.date.display}{lev.country ? ` · ${lev.country}` : ''} · {lev.tag}
                                    </div>
                                    <h1 style={{
                                        fontFamily: 'Newsreader, Georgia, serif',
                                        fontWeight: 400, fontSize: 44, lineHeight: 1.08,
                                        letterSpacing: '-.015em',
                                        margin: '0 0 16px', textWrap: 'pretty',
                                        animation: isTop && dir !== 0 ? 'a-text-in 750ms cubic-bezier(.2,.7,.3,1) both 140ms' : 'none',
                                    }}>{lev.headline}</h1>
                                    {lev.kicker && (
                                        <p style={{
                                            fontFamily: 'Newsreader, Georgia, serif',
                                            fontStyle: 'italic', fontWeight: 400, fontSize: 19, lineHeight: 1.45,
                                            color: 'rgba(26,24,20,.7)',
                                            margin: '0 0 24px', textWrap: 'pretty',
                                            animation: isTop && dir !== 0 ? 'a-text-in 750ms cubic-bezier(.2,.7,.3,1) both 200ms' : 'none',
                                        }}>{lev.kicker}</p>
                                    )}
                                    <p style={{
                                        fontSize: 15.5, lineHeight: 1.6,
                                        color: 'rgba(26,24,20,.85)',
                                        margin: 0, textWrap: 'pretty',
                                        animation: isTop && dir !== 0 ? 'a-text-in 750ms cubic-bezier(.2,.7,.3,1) both 260ms' : 'none',
                                    }}>{lev.text}</p>

                                    {lev.sources.length > 0 && (
                                        <div style={{
                                            marginTop: 20,
                                            animation: isTop && dir !== 0 ? 'a-text-in 750ms cubic-bezier(.2,.7,.3,1) both 320ms' : 'none',
                                        }}>
                                            <div style={{
                                                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                                letterSpacing: '.1em', textTransform: 'uppercase',
                                                color: 'rgba(26,24,20,.5)', marginBottom: 6,
                                            }}>{labels.sources}</div>
                                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                                {lev.sources.map((s, si) => (
                                                    <li key={si} style={{ marginBottom: 4 }}>
                                                        <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                                                            fontFamily: 'Newsreader, Georgia, serif',
                                                            fontSize: 14, lineHeight: 1.45,
                                                            color: 'rgba(26,24,20,.7)',
                                                            textDecoration: 'underline',
                                                            textDecorationColor: 'rgba(26,24,20,.25)',
                                                        }}>{s.title}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div style={{ flex: '1 1 auto' }} />
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        paddingTop: 24, borderTop: '1px solid rgba(26,24,20,.12)',
                                        gap: 12, flexWrap: 'wrap',
                                    }}>
                                        <button
                                            onClick={() => setIdx(Math.max(0, idx - 1))}
                                            disabled={idx === 0}
                                            style={editorialBtnStyle(idx === 0)}
                                        >{labels.prev}</button>
                                        <span style={{
                                            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                            letterSpacing: '.1em', textTransform: 'uppercase',
                                            color: 'rgba(26,24,20,.5)',
                                            flex: '1 1 auto', textAlign: 'center', minWidth: 0,
                                        }}>
                                            {events[idx - 1]?.headline.split(' ').slice(0, 3).join(' ') || '—'}
                                            <span style={{ margin: '0 12px' }}>↔</span>
                                            {events[idx + 1]?.headline.split(' ').slice(0, 3).join(' ') || '—'}
                                        </span>
                                        <button
                                            onClick={() => setIdx(Math.min(events.length - 1, idx + 1))}
                                            disabled={idx === events.length - 1}
                                            style={editorialBtnStyle(idx === events.length - 1)}
                                        >{labels.next}</button>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </main>

                <footer style={{
                    flex: '0 0 auto',
                    padding: '24px 40px 28px',
                    borderTop: '1px solid rgba(26,24,20,.12)',
                    background: '#efe8db',
                    position: 'relative',
                }}>
                    <div style={{ position: 'relative', height: 8, marginBottom: 12 }}>
                        {data.eras.map(e => (
                            <div key={e.id} style={{
                                position: 'absolute',
                                left: `${yearToPct(e.start)}%`,
                                width: `${yearToPct(e.end) - yearToPct(e.start)}%`,
                                height: 8, top: 0,
                                background: eraColor(e.hue, 78, 0.07),
                                borderRadius: 1,
                            }} />
                        ))}
                    </div>

                    <div style={{ position: 'relative', height: 36 }}>
                        <div style={{
                            position: 'absolute', left: 0, right: 0, top: 6, height: 1,
                            background: 'rgba(26,24,20,.2)',
                        }} />
                        {ticks.map(y => (
                            <div key={y} style={{
                                position: 'absolute', left: `${yearToPct(y)}%`, top: 0,
                                transform: 'translateX(-50%)',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                color: 'rgba(26,24,20,.5)', letterSpacing: '.05em',
                            }}>
                                <div style={{ width: 1, height: 5, background: 'rgba(26,24,20,.3)', margin: '0 auto 4px' }} />
                                {y}
                            </div>
                        ))}
                        {events.map((e, i) => {
                            const active = i === idx;
                            const eraObj = data.eras.find(er => er.id === e.era) || { hue: 0 };
                            return (
                                <button
                                    key={e.id}
                                    onClick={() => setIdx(i)}
                                    title={`${e.date.display} — ${e.headline}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${yearToPct(e.date.y)}%`,
                                        top: -2,
                                        transform: `translateX(-50%) ${active ? 'scale(1.25)' : 'scale(1)'}`,
                                        width: 14, height: 14, borderRadius: '50%',
                                        border: active ? '2px solid #1a1814' : '1.5px solid rgba(26,24,20,.4)',
                                        background: active ? eraColor(eraObj.hue, 60, 0.16) : '#f5efe5',
                                        padding: 0, cursor: 'pointer',
                                        transition: 'all .25s cubic-bezier(.2,.7,.3,1)',
                                        zIndex: active ? 2 : 1,
                                    }}
                                />
                            );
                        })}
                    </div>
                </footer>
            </div>
        </>
    );
}

function editorialBtnStyle(disabled) {
    return {
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: 14, fontWeight: 500,
        background: 'transparent', border: 'none',
        color: disabled ? 'rgba(26,24,20,.3)' : '#1a1814',
        cursor: disabled ? 'default' : 'pointer',
        padding: '6px 0',
    };
}
