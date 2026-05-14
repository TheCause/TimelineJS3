import { TimelineConfig } from '../../../core/TimelineConfig';
import { adaptTimelineConfig } from '../timelineConfigToEvents';

function makeJSON(overrides = {}) {
    return {
        events: [
            {
                unique_id: 'sputnik',
                start_date: { year: 1957, month: 10, day: 4 },
                text: {
                    headline: 'Spoutnik 1',
                    text: 'Premier <em>satellite</em> artificiel.',
                    tags: 'Premier',
                },
                group: 'URSS',
                media: {
                    url: 'https://en.wikipedia.org/wiki/Sputnik_1',
                    credit: 'NASA',
                    caption: 'Maquette',
                },
            },
        ],
        eras: [
            {
                start_date: { year: 1957 },
                end_date: { year: 1975 },
                text: { headline: 'Course aux étoiles' },
            },
        ],
        ...overrides,
    };
}

describe('adaptTimelineConfig', () => {
    test('null / undefined config returns empty arrays', () => {
        expect(adaptTimelineConfig(null)).toEqual({ title: null, eras: [], events: [] });
        expect(adaptTimelineConfig(undefined)).toEqual({ title: null, eras: [], events: [] });
    });

    test('maps a basic event with TLDate parts and strips HTML', () => {
        const config = new TimelineConfig(makeJSON());
        const out = adaptTimelineConfig(config);

        expect(out.events).toHaveLength(1);
        const [e] = out.events;
        expect(e.id).toBe('sputnik');
        expect(e.date.y).toBe(1957);
        expect(e.date.m).toBe(10);
        expect(e.date.d).toBe(4);
        expect(e.headline).toBe('Spoutnik 1');
        expect(e.text).toBe('Premier satellite artificiel.');
        expect(e.tag).toBe('Premier');
        expect(e.country).toBe('URSS');
        expect(e.credit).toBe('NASA');
        expect(e.mediaCaption).toBe('Maquette');
    });

    test('maps the single era and assigns it to the event', () => {
        const config = new TimelineConfig(makeJSON());
        const out = adaptTimelineConfig(config);

        expect(out.eras).toHaveLength(1);
        expect(out.eras[0].start).toBe(1957);
        expect(out.eras[0].end).toBe(1975);
        expect(out.eras[0].label).toBe('Course aux étoiles');
        expect(out.events[0].era).toBe(out.eras[0].id);
    });

    test('event outside all eras falls back to closest era', () => {
        const json = makeJSON();
        json.events[0].start_date = { year: 2020, month: 1, day: 1 };
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);

        expect(out.events[0].era).toBe(out.eras[0].id);
    });

    test('era hue palette rotates by index', () => {
        const config = new TimelineConfig({
            events: [{ start_date: { year: 1900 }, text: { headline: 'X' } }],
            eras: Array.from({ length: 5 }, (_, i) => ({
                start_date: { year: 1900 + i * 10 },
                end_date: { year: 1900 + i * 10 + 5 },
                text: { headline: `E${i}` },
            })),
        });
        const out = adaptTimelineConfig(config);
        expect(out.eras.map(e => e.hue)).toEqual([22, 198, 142, 280, 22]);
    });

    test('extracts Wikipedia title and nulls image when wiki present', () => {
        const config = new TimelineConfig(makeJSON());
        const out = adaptTimelineConfig(config);
        expect(out.events[0].wiki).toBe('Sputnik_1');
        expect(out.events[0].image).toBeNull();
        expect(out.events[0].mediaKind).toBe('archive');
    });

    test('detects YouTube media as embed and keeps direct URL', () => {
        const json = makeJSON();
        json.events[0].media.url = 'https://www.youtube.com/watch?v=abc123';
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].mediaKind).toBe('embed');
        expect(out.events[0].wiki).toBeNull();
        expect(out.events[0].image).toBe('https://www.youtube.com/watch?v=abc123');
    });

    test('falls back to "stars" mediaKind when no media url', () => {
        const json = makeJSON();
        json.events[0].media = undefined;
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].mediaKind).toBe('stars');
        expect(out.events[0].image).toBeNull();
        expect(out.events[0].wiki).toBeNull();
    });

    test('fallback: derives wiki image from a Wikipedia source when no media', () => {
        const json = makeJSON();
        json.events[0].media = undefined;
        json.events[0].sources = [
            { title: 'Britannica', url: 'https://www.britannica.com/place/x' },
            { title: 'Wikipédia', url: 'https://fr.wikipedia.org/wiki/Spoutnik_1' },
        ];
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].wiki).toBe('Spoutnik_1');
        expect(out.events[0].image).toBeNull();
    });

    test('fallback: no Wikipedia source leaves the event without an image', () => {
        const json = makeJSON();
        json.events[0].media = undefined;
        json.events[0].sources = [
            { title: 'Britannica', url: 'https://www.britannica.com/place/x' },
        ];
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].wiki).toBeNull();
        expect(out.events[0].image).toBeNull();
    });

    test('fallback: media on the event still wins over Wikipedia sources', () => {
        const json = makeJSON();
        json.events[0].sources = [
            { title: 'Wikipédia', url: 'https://fr.wikipedia.org/wiki/Autre_Page' },
        ];
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].wiki).toBe('Sputnik_1');
    });

    test('handles BC date (negative year)', () => {
        const config = new TimelineConfig({
            events: [{
                start_date: { year: -44, month: 3, day: 15 },
                text: { headline: 'Idus Martiae' },
            }],
        });
        const out = adaptTimelineConfig(config);
        expect(out.events[0].date.y).toBe(-44);
    });

    test('missing fields produce safe defaults', () => {
        const config = new TimelineConfig({
            events: [{
                start_date: { year: 2000 },
                text: { headline: 'Solo' },
            }],
        });
        const out = adaptTimelineConfig(config);
        const [e] = out.events;
        expect(e.date.m).toBe(1);
        expect(e.date.d).toBe(1);
        expect(e.tag).toBe('—');
        expect(e.country).toBe('');
        expect(e.kicker).toBe('');
        expect(e.text).toBe('');
        expect(e.credit).toBe('');
        expect(e.era).toBeNull();
        expect(e.sources).toEqual([]);
    });

    test('sources: maps {title,url} objects and strips HTML in title', () => {
        const json = makeJSON();
        json.events[0].sources = [
            { title: 'Wikipédia — <em>Spoutnik</em>', url: 'https://en.wikipedia.org/wiki/Sputnik_1' },
            { title: 'NASA history', url: 'https://history.nasa.gov/sputnik' },
        ];
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].sources).toEqual([
            { title: 'Wikipédia — Spoutnik', url: 'https://en.wikipedia.org/wiki/Sputnik_1' },
            { title: 'NASA history', url: 'https://history.nasa.gov/sputnik' },
        ]);
    });

    test('sources: accepts bare string URLs and uses URL as title', () => {
        const json = makeJSON();
        json.events[0].sources = ['https://example.org/a', '  https://example.org/b  '];
        const config = new TimelineConfig(json);
        const out = adaptTimelineConfig(config);
        expect(out.events[0].sources).toEqual([
            { title: 'https://example.org/a', url: 'https://example.org/a' },
            { title: 'https://example.org/b', url: 'https://example.org/b' },
        ]);
    });

    test('sources: drops entries without a url and non-array values', () => {
        const json = makeJSON();
        json.events[0].sources = [{ title: 'no url' }, '', { url: 'https://ok.org' }];
        const config = new TimelineConfig(json);
        expect(adaptTimelineConfig(config).events[0].sources).toEqual([
            { title: 'https://ok.org', url: 'https://ok.org' },
        ]);

        const json2 = makeJSON();
        json2.events[0].sources = 'not-an-array';
        const config2 = new TimelineConfig(json2);
        expect(adaptTimelineConfig(config2).events[0].sources).toEqual([]);
    });

    test('uses provided language for display date formatting', () => {
        const fakeLanguage = {
            constructor: { name: 'Language' },
        };
        const fakeTLDate = {
            data: { year: 1969, month: 7, day: 20 },
            getFullYear: () => 1969,
            getDisplayDate: jest.fn(() => '20 juillet 1969'),
        };
        const config = {
            events: [{
                unique_id: 'apollo',
                start_date: fakeTLDate,
                text: { headline: 'Apollo 11' },
            }],
            eras: [],
        };
        const out = adaptTimelineConfig(config, { language: fakeLanguage });
        expect(fakeTLDate.getDisplayDate).toHaveBeenCalledWith(fakeLanguage);
        expect(out.events[0].date.display).toBe('20 juillet 1969');
    });

    test('falls back to ISO-like display when no language given', () => {
        const config = new TimelineConfig(makeJSON());
        const out = adaptTimelineConfig(config);
        expect(out.events[0].date.display).toBe('1957-10-04');
    });
});
