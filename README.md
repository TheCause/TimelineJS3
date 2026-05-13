@thecause/timelinejs
====================

A fork of **TimelineJS3** (Northwestern University Knight Lab) that layers three
React-based rendering "skins" on top of the existing data pipeline.

Upstream: https://github.com/NUKnightLab/TimelineJS3 — original docs at https://timeline.knightlab.com
License: MPL-2.0 (see [LICENSE](LICENSE) and [NOTICE](NOTICE)).

## What this fork adds

- Three alternative rendering directions, opt-in via `options.theme`:
  - **`archive`** — research/database viewer with three palettes (sépia/clair/sombre), search, era filters, density toggle, URL hash routing in standalone mode, keyboard navigation.
  - **`cinematic`** — full-bleed media, Ken-Burns crossfade, autoplay with adjustable per-slide duration, fullscreen, minimal mode.
  - **`editorial`** — magazine-spread layout with crossfade page-turn, era bands, generous typography.
- **`TimelineReact`** — a React-backed mount class with the same `(elem, data, options)` signature as the vanilla `Timeline`.
- **Two bundles**: `dist/js/timeline.js` (vanilla, unchanged) and `dist/js/timeline.react.js` (vanilla + React + skins). React only ships in the second bundle, so existing iframe consumers pay zero extra bytes.
- **i18n**: FR (default) and EN dicts in `src/js/react/labels.js`; selected automatically from `options.language`.
- The vanilla rendering pipeline (Google Sheets / CSV / JSON loading via `ConfigFactory`, `TimelineConfig`, `MediaType`, dates, locales) is **untouched**.

## Quick start

### Iframe embed

The embed page accepts a `?theme=` query param. Without it, the vanilla bundle is loaded and behaves exactly as upstream.

```
…/embed/index.html?source=<YOUR_DATA>&theme=archive
…/embed/index.html?source=<YOUR_DATA>&theme=cinematic&lang=en
```

### Programmatic — vanilla (unchanged)

```js
import { Timeline } from '@thecause/timelinejs';
import '@thecause/timelinejs/dist/css/timeline.css';

new Timeline('timeline-embed', dataSource, options);
```

### Programmatic — React skins

```js
import { TimelineReact } from '@thecause/timelinejs';
// CSS not needed; skins are self-contained.

new TimelineReact('timeline-embed', dataSource, {
  theme: 'archive',       // 'archive' | 'cinematic' | 'editorial'
  language: 'en',         // 'fr' (default) | 'en'
  standalone: true,       // optional: URL hash routing + theme persistence (archive only)
  initialIdx: 0,
});
```

`dataSource` accepts the same inputs as `Timeline`: a Google Sheets URL, a JSON URL, an inline config object, or a `TimelineConfig` instance.

## Demo

A picker covering all 3 directions × 2 languages is shipped in the repo:

```bash
npm install
npm run build
npx http-server -p 8765
# Open http://localhost:8765/examples/react-skins.html?theme=archive&lang=en
```

## Project layout (fork additions)

```
src/js/
├── react/
│   ├── DirectionArchive.jsx       # 'archive' skin
│   ├── DirectionCinematic.jsx     # 'cinematic' skin
│   ├── DirectionEditorial.jsx     # 'editorial' skin
│   ├── SmartImage.jsx             # image component with Wikipedia fallback
│   ├── hooks.js                   # useSlideLayers, useContainerWidth, year range helpers
│   ├── labels.js                  # FR/EN i18n dicts
│   └── adapters/
│       └── timelineConfigToEvents.js   # TimelineConfig → React skin format
├── timeline/
│   ├── Timeline.js                # unchanged upstream
│   └── TimelineReact.jsx          # new — React mount wrapper
├── index.js                       # vanilla entry (timeline.js)
└── index.react.js                 # React entry (timeline.react.js)
```

## Commands

```bash
npm install
npm test           # 138 tests (10 suites), including loadConfig + adapter
npm run build      # both bundles + LESS themes
npm start          # webpack dev server (vanilla)
npm run dist       # clean + build
```

## Development notes

- Node ≥ 22 recommended (project's `.nvmrc` pins a specific version).
- New JSX files go through `babel-loader` + `@babel/preset-react` (automatic runtime). `.js` files are not transpiled, exactly as upstream.
- React 18 is bundled into `timeline.react.js`; its MIT notice is emitted to `dist/js/timeline.react.js.LICENSE.txt` by terser. See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Compatibility with upstream

| Surface | Status |
|---|---|
| `new Timeline(elem, data, options)` | Unchanged. Same imports, same options, same iframe behaviour. |
| `dist/js/timeline.js` / `dist/css/timeline.css` | Bit-compatible with upstream output (modulo bundler version drift). |
| Embed URL without `?theme=` | Identical to upstream. |
| Embed URL with `?theme=archive\|cinematic\|editorial` | New — loads the React bundle. |
| Google Sheets / CSV / JSON data pipeline | Unchanged. |
| Custom `MediaType` regexes | Unchanged. |
| Vanilla locale files (`src/js/language/locale/*.json`) | Unchanged. React skin labels live in `src/js/react/labels.js`. |

## API

The vanilla `Timeline` API is documented upstream: https://github.com/NUKnightLab/TimelineJS3/blob/master/API.md
The `TimelineReact` class accepts the same first two arguments and the following `options`:

- `theme` — required for React rendering. One of `'archive'`, `'cinematic'`, `'editorial'`.
- `language` / `lang` — language code. `/^en/i` → EN dict, else FR. Date formatting uses upstream `Language` loader.
- `script_path` — passed to `loadLanguage` for locale fetching.
- `standalone` — boolean. Archive direction uses URL hash routing and persists theme to `localStorage`.
- `initialIdx` — starting event index (default `0`).
- `defaultTheme` — for Archive: `'sepia'` (default) | `'light'` | `'dark'`.
- `labels` — full dict override (advanced; bypasses language detection).

## Contributing

Issues and PRs welcome on this fork's repository. Upstream contributing guide is at https://github.com/NUKnightLab/TimelineJS3/blob/master/CONTRIBUTING.md and remains relevant for changes to the vanilla data pipeline.

## Credits

This fork builds on the work of the Northwestern University Knight Lab. Original contributors (Zach Wise, Joe Germuska) and the broader Knight Lab team retain credit for the underlying engine. See [NOTICE](NOTICE) for the attribution required by MPL-2.0 §3.3.
