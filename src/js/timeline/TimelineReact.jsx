import React from 'react';
import { createRoot } from 'react-dom/client';
import * as DOM from '../dom/DOM';
import { loadConfig } from '../core/ConfigFactory';
import { loadLanguage, fallback as fallbackLanguage } from '../language/Language';
import { adaptTimelineConfig } from '../react/adapters/timelineConfigToEvents';
import { DirectionArchive } from '../react/DirectionArchive';
import { DirectionCinematic } from '../react/DirectionCinematic';
import { DirectionEditorial } from '../react/DirectionEditorial';
import { pickLabels } from '../react/labels';

const SKINS = {
    archive: { Component: DirectionArchive, key: 'archive' },
    cinematic: { Component: DirectionCinematic, key: 'cinematic' },
    editorial: { Component: DirectionEditorial, key: 'editorial' },
};

// Find the directory the bundle was loaded from, so loadLanguage can resolve
// locale JSON relative to it. Mirrors Timeline.determineScriptPath().
function detectScriptPath() {
    if (typeof document === 'undefined') return '';
    const tagged = document.getElementById('timeline-script-tag');
    if (tagged && tagged.src) return tagged.src.substr(0, tagged.src.lastIndexOf('/') + 1);
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
        const src = scripts[i].src || '';
        if (/timeline(\.react)?\.js(\?|$)/.test(src)) {
            return src.substr(0, src.lastIndexOf('/') + 1);
        }
    }
    return '';
}

/**
 * React-backed mount point for TimelineJS data. Mirrors the surface of the
 * vanilla `Timeline` class (same `(elem, data, options)` signature) but
 * renders one of the React "skins" instead of TimeNav + StorySlider.
 *
 * Options:
 *   - theme: 'archive' (default) | 'cinematic' | 'editorial'
 *   - language: language code (e.g. 'fr'), used for date formatting
 *   - script_path: where to load locale JSON from (defaults to CDN)
 *   - standalone: forwarded to the skin (URL hash routing, theme persistence)
 *   - initialIdx, defaultTheme: forwarded to the skin
 *   - onReady(adapted): invoked once after data is adapted and rendered.
 *     `adapted` exposes `.title.headline`, `.eras`, `.events` — useful to
 *     set document.title, log analytics, etc.
 */
export class TimelineReact {
    constructor(elem, data, options = {}) {
        const skin = options.theme || 'archive';
        const entry = SKINS[skin];
        if (!entry) {
            throw new Error(`TimelineReact: unknown theme "${skin}". Expected one of: ${Object.keys(SKINS).join(', ')}`);
        }
        this._Component = entry.Component;
        this._skinKey = entry.key;
        this._el = DOM.get(elem);
        this._options = options;
        this._root = null;
        this._data = null;
        this._mount(data);
    }

    async _mount(data) {
        const config = await loadConfig(data, {
            sheets_proxy: this._options.sheets_proxy,
        });

        let language = fallbackLanguage;
        const code = this._options.language || this._options.lang;
        if (code) {
            try {
                const loaded = await loadLanguage(code, this._options.script_path || detectScriptPath());
                if (loaded) language = loaded;
            } catch (_e) { /* keep fallback */ }
        }

        const adapted = adaptTimelineConfig(config, { language });
        const labels = this._options.labels
            || pickLabels(this._options.language || this._options.lang)[this._skinKey];

        this._data = adapted;
        this._root = createRoot(this._el);
        const Component = this._Component;
        this._root.render(
            <Component
                data={adapted}
                language={language}
                labels={labels}
                options={this._options}
                standalone={this._options.standalone === true}
                initialIdx={this._options.initialIdx || 0}
                defaultTheme={this._options.defaultTheme}
            />
        );

        if (typeof this._options.onReady === 'function') {
            try { this._options.onReady(adapted); } catch (_e) { /* user callback */ }
        }
    }

    /** Unmount React tree. Safe to call multiple times. */
    destroy() {
        if (this._root) {
            this._root.unmount();
            this._root = null;
        }
    }
}
