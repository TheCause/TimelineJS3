import { useState, useEffect, useRef } from 'react';

/**
 * Track the layout width of a referenced DOM element via ResizeObserver.
 * Returns the latest width in CSS pixels (default 1280 until the observer fires).
 */
export function useContainerWidth(ref) {
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

/**
 * Crossfade helper. When `value` changes, keep the previous layer mounted
 * for `duration + 60`ms so it can animate out, then drop it. Returns an
 * array of `{ id, val, dir }`; the last item is the active (top) layer.
 */
export function useSlideLayers(value, duration = 600) {
    const [layers, setLayers] = useState([{ id: 0, val: value, dir: 0 }]);
    const counter = useRef(0);
    const prev = useRef(value);
    const timer = useRef(null);
    useEffect(() => {
        if (prev.current === value) return;
        const dir = value > prev.current ? 1 : -1;
        prev.current = value;
        counter.current += 1;
        const nextId = counter.current;
        setLayers(L => [...L, { id: nextId, val: value, dir }]);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setLayers(L => [L[L.length - 1]]);
        }, duration + 60);
    }, [value, duration]);
    return layers;
}

/**
 * Year range derived from a list of events, with 4% padding on each side.
 * Used to drive scale labels and tick generation in the skins.
 */
export function computeYearRange(events) {
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

/** Decade ticks (multiples of 10) inside the given range, inclusive. */
export function decadeTicks(min, max) {
    const start = Math.ceil(min / 10) * 10;
    const ticks = [];
    for (let y = start; y <= max; y += 10) ticks.push(y);
    return ticks;
}
