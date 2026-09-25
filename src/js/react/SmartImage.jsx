import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Image component with a graceful Wikipedia fallback.
 *   - `src`: a direct image URL. Tried first if provided.
 *   - `wiki`: a Wikipedia page title (or { title, lang } object).
 *     Resolved via the REST summary API to grab the page's canonical image — robust to URL drift.
 *   - `wikiLang`: Wikipedia language code (e.g. 'en', 'fr', 'de'). Default: 'en'.
 * If both fail (or neither is given), the component renders nothing so its
 * placeholder neighbour stays visible.
 */
export function SmartImage({ src, wiki, wikiLang = 'en', alt, style, fit = 'cover' }) {
    const [url, setUrl] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [phase, setPhase] = useState('init'); // init | src | wiki | error
    const triedWiki = useRef(false);

    const wikiTitle = typeof wiki === 'object' && wiki ? wiki.title : wiki;
    const targetLang = (typeof wiki === 'object' && wiki && wiki.lang) || wikiLang || 'en';

    const fetchWiki = useCallback((title, lang) => {
        if (!title) return;
        triedWiki.current = true;
        const apiHost = `${encodeURIComponent(lang || 'en')}.wikipedia.org`;
        fetch(`https://${apiHost}/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
            .then(r => (r.ok ? r.json() : null))
            .then(j => {
                const u = j && (j.originalimage?.source || j.thumbnail?.source);
                if (u) { setUrl(u); setPhase('wiki'); setLoaded(false); }
                else { setPhase('error'); }
            })
            .catch(() => setPhase('error'));
    }, []);

    useEffect(() => {
        setLoaded(false);
        triedWiki.current = false;
        if (src) { setUrl(src); setPhase('src'); }
        else if (wikiTitle) { fetchWiki(wikiTitle, targetLang); }
        else { setUrl(null); setPhase('error'); }
    }, [src, wikiTitle, targetLang, fetchWiki]);

    const onError = () => {
        if (phase === 'src' && wikiTitle && !triedWiki.current) { fetchWiki(wikiTitle, targetLang); }
        else { setPhase('error'); }
    };

    if (!url || phase === 'error') return null;
    return (
        <img
            src={url}
            alt={alt || ''}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={onError}
            style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: fit,
                opacity: loaded ? 1 : 0,
                transition: 'opacity .55s ease',
                ...style,
            }}
        />
    );
}
