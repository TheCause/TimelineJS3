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
                const loaded = await loadLanguage(code, this._options.script_path || '');
                if (loaded) language = loaded;
            } catch (_e) { /* keep fallback */ }
        }

        const adapted = adaptTimelineConfig(config, { language });
        const labels = this._options.labels
            || pickLabels(this._options.language || this._options.lang)[this._skinKey];

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
    }

    /** Unmount React tree. Safe to call multiple times. */
    destroy() {
        if (this._root) {
            this._root.unmount();
            this._root = null;
        }
    }
}
