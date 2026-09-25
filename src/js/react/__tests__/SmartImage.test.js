import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SmartImage } from '../SmartImage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('SmartImage', () => {
    let container;
    let root;
    const originalFetch = global.fetch;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        global.fetch = originalFetch;
    });

    test('renders img with direct src', () => {
        act(() => {
            root.render(<SmartImage src="https://example.com/test.jpg" alt="Test image" />);
        });

        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBe('https://example.com/test.jpg');
        expect(img.getAttribute('alt')).toBe('Test image');
    });

    test('fetches from correct language Wikipedia API when wiki provided', async () => {
        let calledUrl = null;
        global.fetch = jest.fn((url) => {
            calledUrl = url;
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    originalimage: { source: 'https://upload.wikimedia.org/test.jpg' }
                }),
            });
        });

        await act(async () => {
            root.render(<SmartImage wiki="Spoutnik_1" wikiLang="fr" alt="Spoutnik" />);
        });

        expect(calledUrl).toBe('https://fr.wikipedia.org/api/rest_v1/page/summary/Spoutnik_1');
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBe('https://upload.wikimedia.org/test.jpg');
    });

    test('supports wiki as object with title and lang', async () => {
        let calledUrl = null;
        global.fetch = jest.fn((url) => {
            calledUrl = url;
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    thumbnail: { source: 'https://upload.wikimedia.org/thumb.jpg' }
                }),
            });
        });

        await act(async () => {
            root.render(<SmartImage wiki={{ title: 'Apollo_11', lang: 'de' }} alt="Apollo" />);
        });

        expect(calledUrl).toBe('https://de.wikipedia.org/api/rest_v1/page/summary/Apollo_11');
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBe('https://upload.wikimedia.org/thumb.jpg');
    });

    test('renders nothing when neither src nor wiki is provided', () => {
        act(() => {
            root.render(<SmartImage />);
        });

        expect(container.querySelector('img')).toBeNull();
    });
});
