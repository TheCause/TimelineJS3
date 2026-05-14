import DOMPurify from 'dompurify';
import { lookupMediaType } from '../../media/MediaType';

const ERA_HUES = [22, 198, 142, 280];

const MEDIA_KIND_BY_TYPE = {
    youtube: 'embed',
    vimeo: 'embed',
    dailymotion: 'embed',
    vine: 'embed',
    tiktok: 'embed',
    video: 'embed',
    iframe: 'embed',
    wistia: 'embed',
    image: 'image',
    flickr: 'image',
    instagram: 'image',
    imgur: 'image',
    'wikipedia-image': 'image',
    wikipedia: 'archive',
    twitter: 'archive',
    'twitter-embed': 'archive',
    bluesky: 'archive',
    documentcloud: 'archive',
    pdf: 'archive',
    googledoc: 'archive',
    profile: 'portrait',
    blockquote: 'quote',
    'google-maps': 'map',
    spotify: 'audio',
    soundcloud: 'audio',
    audio: 'audio',
};

function stripHtml(html) {
    if (!html) return '';
    return DOMPurify.sanitize(String(html), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeSources(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .map(s => {
            if (typeof s === 'string') {
                const url = s.trim();
                return url ? { title: url, url } : null;
            }
            if (s && s.url) {
                const url = String(s.url);
                return { title: stripHtml(s.title) || url, url };
            }
            return null;
        })
        .filter(Boolean);
}

function eraYears(era) {
    const start = era.start_date && typeof era.start_date.getFullYear === 'function'
        ? era.start_date.getFullYear()
        : 0;
    const end = era.end_date && typeof era.end_date.getFullYear === 'function'
        ? era.end_date.getFullYear()
        : start;
    return { start, end };
}

function closestEraId(eras, year) {
    if (!eras.length) return null;
    for (const e of eras) {
        if (year >= e.start && year <= e.end) return e.id;
    }
    let best = eras[0];
    let bestDist = Infinity;
    for (const e of eras) {
        const dist = year < e.start ? e.start - year : year - e.end;
        if (dist < bestDist) { bestDist = dist; best = e; }
    }
    return best.id;
}

function detectMediaKind(media) {
    if (!media || !media.url) return 'stars';
    try {
        const match = lookupMediaType({ url: media.url }, false);
        return MEDIA_KIND_BY_TYPE[match.type] || 'stars';
    } catch (_e) {
        return 'stars';
    }
}

function extractWikiTitle(url) {
    if (!url) return null;
    const m = /wikipedia\.org\/wiki\/([^#?]+)/i.exec(url);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (_e) { return m[1]; }
}

function tldateParts(tldate) {
    if (!tldate) return { y: 1970, m: 1, d: 1 };
    const data = tldate.data || {};
    const y = typeof tldate.getFullYear === 'function'
        ? tldate.getFullYear()
        : (data.year != null ? Number(data.year) : 1970);
    const m = Number.parseInt(data.month, 10);
    const d = Number.parseInt(data.day, 10);
    return {
        y,
        m: Number.isFinite(m) && m >= 1 ? m : 1,
        d: Number.isFinite(d) && d >= 1 ? d : 1,
    };
}

function displayDate(tldate, language) {
    if (!tldate) return '';
    if (language && typeof tldate.getDisplayDate === 'function') {
        try { return tldate.getDisplayDate(language); } catch (_e) { /* fall through */ }
    }
    const { y, m, d } = tldateParts(tldate);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Convert a normalized TimelineConfig into the data shape consumed by the
 * React skins. Pure: no DOM access, no side effects, no React.
 *
 * @param {import('../../core/TimelineConfig').TimelineConfig|null|undefined} config
 * @param {object} [options]
 * @param {import('../../language/Language').Language} [options.language]
 * @returns {{ title: object|null, eras: Array, events: Array }}
 */
export function adaptTimelineConfig(config, options = {}) {
    if (!config) return { title: null, eras: [], events: [] };
    const { language } = options;

    const eras = (config.eras || []).map((era, i) => {
        const { start, end } = eraYears(era);
        return {
            id: era.unique_id || `era-${i}`,
            label: stripHtml(era.headline) || `Era ${i + 1}`,
            start,
            end,
            hue: ERA_HUES[i % ERA_HUES.length],
        };
    });

    const events = (config.events || []).map((ev, i) => {
        const parts = tldateParts(ev.start_date);
        const mediaUrl = ev.media && ev.media.url ? String(ev.media.url) : '';
        const wiki = extractWikiTitle(mediaUrl);
        const tags = ev.text && ev.text.tags;
        const tagList = typeof tags === 'string'
            ? tags.split(',').map(t => t.trim()).filter(Boolean)
            : (Array.isArray(tags) ? tags : []);

        return {
            id: ev.unique_id || `ev-${i}`,
            date: {
                y: parts.y,
                m: parts.m,
                d: parts.d,
                display: displayDate(ev.start_date, language),
            },
            era: closestEraId(eras, parts.y),
            tag: tagList[0] || '—',
            country: ev.group || '',
            headline: stripHtml(ev.text && ev.text.headline),
            kicker: stripHtml(ev.text && ev.text.subheadline) || '',
            text: stripHtml(ev.text && ev.text.text) || '',
            mediaKind: detectMediaKind(ev.media),
            mediaCaption: (ev.media && ev.media.caption) || '',
            image: wiki ? null : (mediaUrl || null),
            wiki,
            credit: (ev.media && ev.media.credit) || '',
            sources: normalizeSources(ev.sources),
        };
    });

    let title = null;
    if (config.title) {
        title = {
            headline: stripHtml(config.title.text && config.title.text.headline) || '',
            subhead: stripHtml(config.title.text && config.title.text.subheadline) || '',
            text: stripHtml(config.title.text && config.title.text.text) || '',
            date: events.length
                ? `${events[0].date.y} — ${events[events.length - 1].date.y}`
                : '',
        };
    }

    return { title, eras, events };
}
