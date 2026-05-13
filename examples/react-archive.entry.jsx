import React from 'react';
import { createRoot } from 'react-dom/client';
import { loadConfig } from '../src/js/core/ConfigFactory';
import { adaptTimelineConfig } from '../src/js/react/adapters/timelineConfigToEvents';
import { DirectionArchive } from '../src/js/react/DirectionArchive';

// Elizabeth Taylor sample — extracted from New/integration-bridge.html so the
// demo runs without a network round-trip.
const RAW = {
    timeline: {
        headline: 'Elizabeth Taylor — 1932–2011',
        type: 'default',
        text: "Une chronologie des moments-clés de la vie d'Elizabeth Taylor.",
        date: [
            { startDate: '1932,2,27', headline: 'Naissance à Londres',
                text: 'Elizabeth Rosemond Taylor naît à Hampstead, Londres, de parents américains.',
                tags: 'Personal life', asset: { caption: 'Hampstead, Londres' } },
            { startDate: '1944,1,1', headline: 'National Velvet',
                text: 'À 12 ans, Taylor crève l’écran dans <em>National Velvet</em>.',
                tags: 'Career', asset: { credit: 'MGM', caption: 'National Velvet, MGM' } },
            { startDate: '1958,1,1', headline: 'Cat on a Hot Tin Roof',
                text: 'Nomination aux Oscars pour <em>La Chatte sur un toit brûlant</em>.',
                tags: 'Career', asset: { credit: 'MGM' } },
            { startDate: '1963,6,12', headline: 'Cléopâtre',
                text: 'Le tournage le plus cher d’Hollywood. Elle rencontre Richard Burton.',
                tags: 'Career, Marriages', asset: { credit: '20th Century Fox', caption: 'Avec Richard Burton' } },
            { startDate: '1985,1,1', endDate: '2011,3,23', headline: 'Activisme SIDA',
                text: 'Cofondatrice de l’AmFAR, elle consacre les dernières décennies à la lutte contre le sida.',
                tags: 'Personal life', asset: { caption: 'Avec Magic Johnson, 1997' } },
            { startDate: '2011,3,23', headline: 'Décès à Los Angeles',
                text: 'Elle s’éteint d’insuffisance cardiaque à Cedars-Sinai.',
                tags: 'Personal life' },
        ],
        era: [
            { startDate: '1932,1,1', endDate: '1949,12,31', headline: 'Enfance' },
            { startDate: '1950,1,1', endDate: '1979,12,31', headline: 'Âge d’or' },
            { startDate: '1980,1,1', endDate: '2011,3,23', headline: 'Engagements' },
        ],
    },
};

// Convert the public TimelineJS v2 JSON shape into the internal JSON shape
// that TimelineConfig expects. (The bridge in New/ does the same step.)
function v2ToInternal(raw) {
    const T = raw.timeline || raw;
    const parseDate = (s) => {
        if (!s) return undefined;
        const [y, m, d] = String(s).split(',').map(n => parseInt(n, 10));
        return { year: y, month: m || 1, day: d || 1 };
    };
    return {
        title: T.headline ? { text: { headline: T.headline, text: T.text || '' } } : undefined,
        events: (T.date || []).map(ev => ({
            start_date: parseDate(ev.startDate),
            end_date: parseDate(ev.endDate),
            text: { headline: ev.headline || '', text: ev.text || '', tags: ev.tags || '' },
            group: ev.group,
            media: ev.asset ? { url: ev.asset.media || '', caption: ev.asset.caption || '', credit: ev.asset.credit || '' } : undefined,
        })),
        eras: (T.era || []).map(e => ({
            start_date: parseDate(e.startDate),
            end_date: parseDate(e.endDate),
            text: { headline: e.headline || '' },
        })),
    };
}

async function mount() {
    const internal = v2ToInternal(RAW);
    const config = await loadConfig(internal);
    const data = adaptTimelineConfig(config);
    const root = createRoot(document.getElementById('root'));
    root.render(<DirectionArchive data={data} standalone={true} defaultTheme="sepia" />);
}

mount();
