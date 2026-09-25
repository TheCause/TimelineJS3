// ESM entry-point for direct consumption of the React skins and helpers.
// Lets external apps (e.g. timelinejs-forge) import skin components without
// loading the UMD bundle.

export { DirectionArchive, C_THEMES } from "./DirectionArchive.jsx";
export { DirectionCinematic } from "./DirectionCinematic.jsx";
export { DirectionEditorial } from "./DirectionEditorial.jsx";
export { SmartImage } from "./SmartImage.jsx";
export { adaptTimelineConfig } from "./adapters/timelineConfigToEvents.js";
export { LABELS_FR, LABELS_EN, pickLabels } from "./labels.js";
export { useSlideLayers, useContainerWidth, computeYearRange, decadeTicks } from "./hooks.js";
