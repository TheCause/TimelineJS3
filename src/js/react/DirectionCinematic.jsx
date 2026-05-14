import React, { useState, useEffect, useRef } from 'react';
import { SmartImage } from './SmartImage';
import { useSlideLayers, computeYearRange, decadeTicks } from './hooks';
import { LABELS_FR } from './labels';

// --- Media placeholder, cinematic flavour --------------------------------
function CinematicMedia({ kind, id, image, credit, wiki }) {
    const palette = {
        satellite: ['#0a0a0c', '#1c1f24', '#2b3038'],
        portrait:  ['#0a0908', '#1f1814', '#3a2a20'],
        lunar:     ['#0a0a0e', '#16161c', '#2c2c34'],
        probe:     ['#0a0c08', '#181c12', '#2a3020'],
        shuttle:   ['#08090c', '#121826', '#1f2c44'],
        smoke:     ['#0c0a08', '#1c1814', '#36302a'],
        stars:     ['#06060c', '#0e1226', '#1e2858'],
        station:   ['#08090b', '#141a22', '#243240'],
        mars:      ['#1a0a06', '#34160e', '#5a2a18'],
        rover:     ['#150c08', '#2a1c14', '#4a3424'],
        pluto:     ['#08060a', '#160e1e', '#2c1e3a'],
        launch:    ['#08070a', '#1a1814', '#3a3024'],
        telescope: ['#0a0808', '#1c1610', '#3a2c1a'],
        orion:     ['#04060c', '#0c1424', '#1a2c4a'],
        image:     ['#0a0a0c', '#1c1f24', '#2b3038'],
        embed:     ['#0a0a0c', '#1c1f24', '#2b3038'],
        archive:   ['#0c0a08', '#1c1814', '#36302a'],
        map:       ['#08090c', '#121826', '#1f2c44'],
        audio:     ['#08060a', '#160e1e', '#2c1e3a'],
        quote:     ['#0a0908', '#1f1814', '#3a2a20'],
    }[kind] || ['#0a0a0c', '#1c1f24', '#2b3038'];

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at 30% 40%, ${palette[2]} 0%, ${palette[1]} 45%, ${palette[0]} 100%)`,
            }} />
            <div style={{
                position: 'absolute', left: '32%', top: '52%',
                transform: 'translate(-50%, -50%)',
                width: 'min(48%, 380px)', aspectRatio: '1 / 1',
                borderRadius: '50%',
                background: `radial-gradient(circle at 38% 35%, ${palette[2]} 0%, ${palette[1]} 45%, #000 85%)`,
                boxShadow: `inset -30px -30px 80px rgba(0,0,0,.75), 0 0 120px ${palette[2]}55`,
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage:
                    'radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,.7) 0, transparent 100%),' +
                    'radial-gradient(1px 1px at 78% 31%, rgba(255,255,255,.5) 0, transparent 100%),' +
                    'radial-gradient(1px 1px at 41% 67%, rgba(255,255,255,.6) 0, transparent 100%),' +
                    'radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,.4) 0, transparent 100%),' +
                    'radial-gradient(1px 1px at 63% 14%, rgba(255,255,255,.6) 0, transparent 100%),' +
                    'radial-gradient(1px 1px at 22% 84%, rgba(255,255,255,.5) 0, transparent 100%),' +
                    'radial-gradient(1px 1px at 92% 48%, rgba(255,255,255,.3) 0, transparent 100%)',
                opacity: kind === 'stars' || kind === 'pluto' || kind === 'orion' ? 1 : 0.45,
            }} />
            <SmartImage src={image} wiki={wiki} alt={credit} />
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,.018) 0 1px, transparent 1px 3px)',
                mixBlendMode: 'overlay',
            }} />
            <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%',
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,.5) 70%, rgba(0,0,0,.85) 100%)',
            }} />
            <div style={{
                position: 'absolute', left: 0, right: 0, top: 0, height: '30%',
                background: 'linear-gradient(180deg, rgba(0,0,0,.7) 0%, transparent 100%)',
            }} />
        </div>
    );
}

/**
 * Cinematic direction — full-bleed media, ambient dark, Ken Burns + autoplay.
 */
export function DirectionCinematic({ data, initialIdx = 0, labels: labelsProp }) {
    if (!data || !data.events || data.events.length === 0) return null;
    const labels = labelsProp || LABELS_FR.cinematic;
    const events = data.events;
    const safeInitial = Math.max(0, Math.min(initialIdx, events.length - 1));
    const [idx, setIdx] = useState(safeInitial);
    const ev = events[idx];
    const era = data.eras.find(e => e.id === ev.era) || { id: 'fallback', label: '—', hue: 0 };

    const { min: yearMin, max: yearMax } = computeYearRange(events);
    const range = Math.max(1, yearMax - yearMin);
    const yearToPct = y => ((y - yearMin) / range) * 100;
    const ticks = decadeTicks(yearMin, yearMax);

    // Density bins (5-year buckets) for the histogram
    const bins = [];
    for (let y = yearMin; y < yearMax; y += 5) {
        const count = events.filter(e => e.date.y >= y && e.date.y < y + 5).length;
        bins.push({ y, count });
    }
    const maxCount = Math.max(...bins.map(b => b.count), 1);

    // Animated year readout
    const [displayYear, setDisplayYear] = useState(ev.date.y);
    useEffect(() => {
        let start = displayYear, end = ev.date.y;
        if (start === end) return;
        let frame, t0;
        const dur = 380;
        const tick = (t) => {
            if (!t0) t0 = t;
            const k = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - k, 3);
            setDisplayYear(Math.round(start + (end - start) * eased));
            if (k < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx]);

    const mediaLayers = useSlideLayers(idx, 900);

    const rootRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [duration, setDuration] = useState(6000);
    const [minimal, setMinimal] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (!playing) { setProgress(0); return; }
        setProgress(0);
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const k = (now - start) / duration;
            if (k >= 1) {
                setIdx(i => (i + 1) % events.length);
            } else {
                setProgress(k);
                raf = requestAnimationFrame(tick);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, idx, duration, events.length]);

    useEffect(() => {
        if (!hovered) return;
        const onKey = (e) => {
            const tgt = e.target;
            if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
            if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
            else if (e.code === 'ArrowRight') setIdx(i => Math.min(events.length - 1, i + 1));
            else if (e.code === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
            else if (e.code === 'KeyM') setMinimal(m => !m);
            else if (e.code === 'KeyF') toggleFullscreen();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [hovered, events.length]);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else rootRef.current?.requestFullscreen?.().catch(() => {});
    };

    return (
        <>
            <style>{`
                @keyframes b-fade-in  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes b-fade-out { from { opacity: 1 } to { opacity: 0 } }
                @keyframes b-kenburns {
                    from { transform: scale(1.0)  translate(0%, 0%); }
                    to   { transform: scale(1.14) translate(-3%, 2%); }
                }
                @keyframes b-text-rise {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div
                ref={rootRef}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: 'absolute', inset: 0,
                    background: '#050505',
                    color: '#f0eee9',
                    fontFamily: '"Archivo", "Inter Tight", system-ui, sans-serif',
                    overflow: 'hidden',
                }}
            >
                <div style={{ position: 'absolute', inset: 0 }}>
                    {mediaLayers.map((layer, li) => {
                        const lev = events[layer.val];
                        const isTop = li === mediaLayers.length - 1;
                        return (
                            <div key={layer.id} style={{
                                position: 'absolute', inset: 0,
                                animation: isTop && layer.dir !== 0
                                    ? 'b-fade-in 900ms ease-out both'
                                    : (!isTop ? 'b-fade-out 900ms ease-out both' : 'none'),
                            }}>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    animation: 'b-kenburns 16s cubic-bezier(.2,.4,.3,1) both',
                                    transformOrigin: '40% 40%',
                                }}>
                                    <CinematicMedia kind={lev.mediaKind} id={lev.id} image={lev.image} credit={lev.credit} wiki={lev.wiki} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="tl-topbar" style={{
                    position: 'absolute', top: 24, left: 32, right: 32,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    zIndex: 2,
                    opacity: minimal ? 0 : 1, pointerEvents: minimal ? 'none' : 'auto',
                    transition: 'opacity .4s ease',
                }}>
                    <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        letterSpacing: '.18em', textTransform: 'uppercase',
                        color: 'rgba(240,238,233,.65)',
                    }}>
                        {data.title?.headline || 'TIMELINE'} <span style={{ opacity: 0.5, margin: '0 8px' }}>—</span> {events.length} {labels.jalonsSuffix}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                            letterSpacing: '.18em', color: 'rgba(240,238,233,.55)',
                        }}>
                            {String(idx + 1).padStart(2, '0')} <span style={{ opacity: .4 }}>/</span> {String(events.length).padStart(2, '0')}
                        </span>
                        <span style={{ width: 1, height: 12, background: 'rgba(240,238,233,.2)' }} />
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: `oklch(70% 0.18 ${era.hue})`,
                            boxShadow: `0 0 12px oklch(70% 0.18 ${era.hue})`,
                        }} />
                        <span style={{
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                            letterSpacing: '.18em', textTransform: 'uppercase',
                            color: 'rgba(240,238,233,.85)',
                        }}>{era.label}</span>
                    </div>
                </div>

                <div style={{
                    position: 'absolute', top: 80, bottom: 200, right: 32,
                    width: 6, display: 'flex', flexDirection: 'column', gap: 6,
                    zIndex: 2,
                    opacity: minimal ? 0 : 1, pointerEvents: minimal ? 'none' : 'auto',
                    transition: 'opacity .4s ease',
                }}>
                    {events.map((e, i) => {
                        const active = i === idx;
                        const eraObj = data.eras.find(er => er.id === e.era) || { hue: 0 };
                        return (
                            <button
                                key={e.id}
                                onClick={() => setIdx(i)}
                                title={`${e.date.y} — ${e.headline}`}
                                style={{
                                    flex: 1, width: '100%', border: 'none',
                                    background: active ? `oklch(70% 0.18 ${eraObj.hue})` : 'rgba(240,238,233,.18)',
                                    borderRadius: 3, cursor: 'pointer', padding: 0,
                                    transition: 'background .2s, transform .2s',
                                    transform: active ? 'scaleX(2.2)' : 'scaleX(1)',
                                    transformOrigin: 'right',
                                    boxShadow: active ? `0 0 16px oklch(70% 0.18 ${eraObj.hue}55)` : 'none',
                                }}
                            />
                        );
                    })}
                </div>

                <div style={{
                    position: 'absolute', left: 32, top: 80, zIndex: 2,
                    display: 'flex', alignItems: 'baseline', gap: 14,
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        fontFamily: '"Archivo", system-ui, sans-serif',
                        fontWeight: 800, fontSize: 168, lineHeight: 0.85,
                        letterSpacing: '-.045em',
                        color: '#f0eee9',
                        fontFeatureSettings: '"tnum"',
                        mixBlendMode: 'difference',
                    }}>{displayYear}</div>
                    <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        letterSpacing: '.18em', textTransform: 'uppercase',
                        color: 'rgba(240,238,233,.65)',
                        paddingBottom: 8,
                    }}>
                        {ev.date.display.split(' ').slice(0, 2).join(' ')}
                    </div>
                </div>

                <div key={idx} style={{
                    position: 'absolute', left: 32, right: 32, bottom: 96,
                    zIndex: 2, maxWidth: 760,
                    animation: 'b-text-rise 700ms cubic-bezier(.2,.7,.3,1) both 120ms',
                }}>
                    <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        letterSpacing: '.16em', textTransform: 'uppercase',
                        color: `oklch(78% 0.16 ${era.hue})`,
                        marginBottom: 12,
                        animation: 'b-text-rise 700ms cubic-bezier(.2,.7,.3,1) both',
                    }}>
                        {ev.country && <>{ev.country} <span style={{ opacity: .5, margin: '0 8px' }}>·</span> </>}{ev.tag}
                    </div>
                    <h1 style={{
                        fontFamily: '"Archivo", system-ui, sans-serif',
                        fontWeight: 700, fontSize: 48, lineHeight: 1.02,
                        letterSpacing: '-.02em',
                        margin: '0 0 12px',
                        textWrap: 'balance',
                        animation: 'b-text-rise 750ms cubic-bezier(.2,.7,.3,1) both 60ms',
                    }}>{ev.headline}</h1>
                    <p style={{
                        fontFamily: '"Inter Tight", system-ui, sans-serif',
                        fontWeight: 400, fontSize: 16, lineHeight: 1.55,
                        color: 'rgba(240,238,233,.78)',
                        margin: 0, maxWidth: 620, textWrap: 'pretty',
                        animation: 'b-text-rise 800ms cubic-bezier(.2,.7,.3,1) both 160ms',
                    }}>
                        {ev.kicker && <em style={{ fontStyle: 'italic', opacity: .85 }}>{ev.kicker}.</em>}
                        {ev.kicker ? ' ' : ''}{ev.text}
                    </p>
                    {ev.sources.length > 0 && (
                        <div style={{
                            marginTop: 14,
                            display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 14px',
                            opacity: minimal ? 0 : 1,
                            transition: 'opacity .4s ease',
                            animation: 'b-text-rise 850ms cubic-bezier(.2,.7,.3,1) both 240ms',
                        }}>
                            <span style={{
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                letterSpacing: '.16em', textTransform: 'uppercase',
                                color: 'rgba(240,238,233,.5)',
                            }}>{labels.sources}</span>
                            {ev.sources.map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                                    fontFamily: '"Inter Tight", system-ui, sans-serif',
                                    fontSize: 12, lineHeight: 1.4,
                                    color: 'rgba(240,238,233,.7)',
                                    textDecoration: 'underline',
                                    textDecorationColor: 'rgba(240,238,233,.3)',
                                }}>{s.title}</a>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ position: 'absolute', left: 32, right: 32, bottom: 28, zIndex: 2 }}>
                    <div style={{
                        position: 'relative', height: 32, marginBottom: 8,
                        display: 'flex', alignItems: 'flex-end', gap: 2,
                        opacity: minimal ? 0 : 1, transition: 'opacity .4s ease',
                    }}>
                        {bins.map((b) => {
                            const inActive = b.y <= ev.date.y && ev.date.y < b.y + 5;
                            return (
                                <div key={b.y} style={{
                                    flex: 1, height: `${(b.count / maxCount) * 100}%`,
                                    minHeight: 2,
                                    background: inActive ? '#f0eee9' : 'rgba(240,238,233,.25)',
                                    transition: 'background .25s',
                                    borderRadius: '2px 2px 0 0',
                                }} />
                            );
                        })}
                    </div>
                    <div style={{ position: 'relative', height: 18 }}>
                        <div style={{
                            position: 'absolute', left: 0, right: 0, top: 8, height: 1,
                            background: 'rgba(240,238,233,.2)',
                        }} />
                        {ticks.map(y => (
                            <div key={y} style={{
                                position: 'absolute', left: `${yearToPct(y)}%`, top: 4,
                                transform: 'translateX(-50%)',
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                                letterSpacing: '.05em', color: 'rgba(240,238,233,.4)',
                            }}>
                                <div style={{
                                    width: 1, height: 8, background: 'rgba(240,238,233,.2)',
                                    margin: '0 auto',
                                }} />
                            </div>
                        ))}
                        {events.map((e, i) => {
                            const active = i === idx;
                            return (
                                <button
                                    key={e.id}
                                    onClick={() => setIdx(i)}
                                    style={{
                                        position: 'absolute',
                                        left: `${yearToPct(e.date.y)}%`,
                                        top: 5,
                                        transform: `translateX(-50%) ${active ? 'scale(1.5)' : 'scale(1)'}`,
                                        width: 7, height: 7, borderRadius: '50%',
                                        border: 'none',
                                        background: active ? '#f0eee9' : 'rgba(240,238,233,.5)',
                                        boxShadow: active ? '0 0 16px rgba(240,238,233,.8)' : 'none',
                                        padding: 0, cursor: 'pointer',
                                        transition: 'all .25s cubic-bezier(.2,.7,.3,1)',
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                        letterSpacing: '.1em', color: 'rgba(240,238,233,.45)',
                        marginTop: 6,
                        opacity: minimal ? 0 : 1, transition: 'opacity .4s ease',
                    }}>
                        <span>{yearMin}</span>
                        <span>{yearMax}</span>
                    </div>
                </div>

                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: 'rgba(240,238,233,.08)',
                    zIndex: 3,
                    opacity: playing ? 1 : 0,
                    transition: 'opacity .3s ease',
                }}>
                    <div style={{
                        height: '100%', width: `${progress * 100}%`,
                        background: `oklch(75% 0.18 ${era.hue})`,
                        boxShadow: `0 0 12px oklch(75% 0.18 ${era.hue})`,
                    }} />
                </div>

                <div style={{
                    position: 'absolute', right: 32, bottom: 88, zIndex: 4,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 8px',
                    background: 'rgba(10,10,12,.65)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(240,238,233,.12)',
                    borderRadius: 999,
                }}>
                    <BIconBtn title={labels.prev} onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
                        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </BIconBtn>
                    <BIconBtn title={playing ? labels.pause : labels.play} onClick={() => setPlaying(p => !p)} primary>
                        {playing
                            ? <svg width="12" height="12" viewBox="0 0 12 12"><rect x="3" y="2" width="2.4" height="8" fill="currentColor"/><rect x="6.6" y="2" width="2.4" height="8" fill="currentColor"/></svg>
                            : <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3.5 2L9.5 6L3.5 10Z" fill="currentColor"/></svg>}
                    </BIconBtn>
                    <BIconBtn title={labels.next} onClick={() => setIdx(Math.min(events.length - 1, idx + 1))} disabled={idx === events.length - 1}>
                        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </BIconBtn>
                    <span style={{ width: 1, height: 14, background: 'rgba(240,238,233,.18)', margin: '0 4px' }} />
                    <div style={{ display: 'flex', gap: 2 }}>
                        {[[4000, '4s'], [6000, '6s'], [10000, '10s']].map(([ms, label]) => (
                            <button
                                key={ms}
                                onClick={() => setDuration(ms)}
                                title={`${labels.durationPrefix}${label}`}
                                style={{
                                    padding: '4px 7px',
                                    background: duration === ms ? 'rgba(240,238,233,.18)' : 'transparent',
                                    color: duration === ms ? '#f0eee9' : 'rgba(240,238,233,.55)',
                                    border: 'none', borderRadius: 999,
                                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                                    letterSpacing: '.04em', cursor: 'pointer',
                                    transition: 'background .15s, color .15s',
                                }}
                            >{label}</button>
                        ))}
                    </div>
                    <span style={{ width: 1, height: 14, background: 'rgba(240,238,233,.18)', margin: '0 4px' }} />
                    <BIconBtn title={labels.minimal} onClick={() => setMinimal(m => !m)} active={minimal}>
                        {minimal
                            ? <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
                            : <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" fill="currentColor"/></svg>}
                    </BIconBtn>
                    <BIconBtn title={labels.fullscreen} onClick={toggleFullscreen}>
                        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 4V2H4M10 4V2H8M2 8V10H4M10 8V10H8" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
                    </BIconBtn>
                </div>

                {minimal && (
                    <div style={{
                        position: 'absolute', top: 20, left: '50%',
                        transform: 'translateX(-50%)',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                        letterSpacing: '.18em', textTransform: 'uppercase',
                        color: 'rgba(240,238,233,.35)',
                        pointerEvents: 'none', zIndex: 3,
                    }}>
                        {labels.minimalHint}
                    </div>
                )}
            </div>
        </>
    );
}

function BIconBtn({ children, onClick, title, disabled, primary, active }) {
    const base = {
        width: 26, height: 26, borderRadius: 999, border: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', padding: 0,
        transition: 'background .15s, color .15s, transform .12s',
    };
    let bg = 'transparent', fg = 'rgba(240,238,233,.75)';
    if (primary) { bg = 'rgba(240,238,233,.92)'; fg = '#0a0a0c'; }
    else if (active) { bg = 'rgba(240,238,233,.18)'; fg = '#f0eee9'; }
    if (disabled) fg = 'rgba(240,238,233,.25)';
    return (
        <button onClick={disabled ? undefined : onClick} title={title}
            style={{ ...base, background: bg, color: fg }}>
            {children}
        </button>
    );
}
