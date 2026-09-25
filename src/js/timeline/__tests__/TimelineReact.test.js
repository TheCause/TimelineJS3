import { act } from 'react';
import { TimelineReact } from '../TimelineReact.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TimelineReact', () => {
    let container;

    const sampleData = {
        title: {
            text: { headline: 'Test Timeline' },
        },
        events: [
            {
                start_date: { year: 1969, month: 7, day: 20 },
                text: { headline: 'Moon Landing' },
            },
        ],
    };

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'timeline-root';
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    test('throws error on unknown theme', () => {
        expect(() => {
            new TimelineReact(container, sampleData, { theme: 'unknown_theme' });
        }).toThrow(/TimelineReact: unknown theme "unknown_theme"/);
    });

    test('instantiates with valid themes without error', async () => {
        const skins = ['archive', 'cinematic', 'editorial'];
        for (const theme of skins) {
            let tl;
            await act(async () => {
                tl = new TimelineReact(container, sampleData, { theme });
                await new Promise(r => setTimeout(r, 20));
            });
            expect(tl).toBeInstanceOf(TimelineReact);
            await act(async () => {
                tl.destroy();
            });
        }
    });

    test('calls onReady callback once mounted with adapted data', async () => {
        let readyData = null;
        let tl;
        await act(async () => {
            tl = new TimelineReact(container, sampleData, {
                theme: 'archive',
                onReady: (adapted) => {
                    readyData = adapted;
                },
            });
            await new Promise(r => setTimeout(r, 50));
        });

        expect(readyData).not.toBeNull();
        expect(readyData.title.headline).toBe('Test Timeline');
        expect(readyData.events.length).toBe(1);
        expect(readyData.events[0].headline).toBe('Moon Landing');

        await act(async () => {
            tl.destroy();
        });
    });

    test('destroy can be called safely multiple times', async () => {
        let tl;
        await act(async () => {
            tl = new TimelineReact(container, sampleData);
            await new Promise(r => setTimeout(r, 20));
        });
        expect(() => {
            act(() => {
                tl.destroy();
                tl.destroy();
            });
        }).not.toThrow();
    });
});
