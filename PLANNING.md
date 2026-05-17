# TimelineJS3 — Planning

> Fork autonome `@thecause/timelinejs` : 3 skins React + viewer + landing. Deploye o2switch `timeline.rqz-prospective.fr` (14 mai).
> Voir aussi memoire `project_timelinejs_fork.md`. Repo data separe `timeline-data`.
> Sans dates volontairement.

## EN COURS

(rien)

## FAIT

- [x] **Title dynamique view.html** (17 mai) — TimelineReact expose `options.onReady(adapted)` ; view.html set `document.title` post-mount (vanilla via event `ready`, React via callback)
- [x] **Options video cinematic** (17 mai) — `autoplay`, `loop`, `cinematicDuration`, `chrome=hidden` (masque topbar / track / controls / home-link). Evenement `cinematic:end` (CustomEvent bubbles) sur le root avec detail `{looped, idx, total}`
