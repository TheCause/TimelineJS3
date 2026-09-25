import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { computeYearRange, decadeTicks, useSlideLayers } from '../hooks';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('computeYearRange', () => {
    test('returns default range for empty or null events', () => {
        expect(computeYearRange([])).toEqual({ min: 1900, max: 2025 });
        expect(computeYearRange(null)).toEqual({ min: 1900, max: 2025 });
    });

    test('computes min and max with 4% padding', () => {
        const events = [
            { date: { y: 1950 } },
            { date: { y: 2000 } },
        ];
        // span = 50, pad = round(50 * 0.04) = 2
        expect(computeYearRange(events)).toEqual({ min: 1948, max: 2002 });
    });

    test('handles single event with minimum pad of 1', () => {
        const events = [{ date: { y: 1969 } }];
        // span = 1, pad = 1
        expect(computeYearRange(events)).toEqual({ min: 1968, max: 1970 });
    });
});

describe('decadeTicks', () => {
    test('generates decade multiples within bounds', () => {
        expect(decadeTicks(1948, 1982)).toEqual([1950, 1960, 1970, 1980]);
        expect(decadeTicks(1990, 2010)).toEqual([1990, 2000, 2010]);
    });

    test('returns empty array when no decades fall in range', () => {
        expect(decadeTicks(1951, 1959)).toEqual([]);
    });
});

describe('useSlideLayers', () => {
    let container;
    let root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        jest.useRealTimers();
    });

    test('initializes with layer at initial index', () => {
        let recordedLayers = null;
        function TestComp({ value }) {
            const layers = useSlideLayers(value, 300);
            recordedLayers = layers;
            return null;
        }

        act(() => {
            root.render(<TestComp value={0} />);
        });

        expect(recordedLayers).toEqual([{ id: 0, val: 0, dir: 0 }]);
    });

    test('tracks direction forward and prunes older layer after timeout', () => {
        let recordedLayers = null;
        function TestComp({ value }) {
            const layers = useSlideLayers(value, 300);
            recordedLayers = layers;
            return null;
        }

        act(() => {
            root.render(<TestComp value={0} />);
        });

        act(() => {
            root.render(<TestComp value={1} />);
        });

        expect(recordedLayers.length).toBe(2);
        expect(recordedLayers[1].val).toBe(1);
        expect(recordedLayers[1].dir).toBe(1); // forward

        // Advance timers past duration + 60ms = 360ms
        act(() => {
            jest.advanceTimersByTime(400);
        });

        expect(recordedLayers.length).toBe(1);
        expect(recordedLayers[0].val).toBe(1);
    });

    test('tracks direction backward when index decreases', () => {
        let recordedLayers = null;
        function TestComp({ value }) {
            const layers = useSlideLayers(value, 300);
            recordedLayers = layers;
            return null;
        }

        act(() => {
            root.render(<TestComp value={2} />);
        });

        act(() => {
            root.render(<TestComp value={1} />);
        });

        expect(recordedLayers[1].dir).toBe(-1); // backward
    });
});
