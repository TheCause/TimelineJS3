import { LABELS_FR, LABELS_EN, pickLabels } from '../labels';

describe('labels and pickLabels', () => {
    test('defaults to French when no code or unknown code is provided', () => {
        expect(pickLabels()).toBe(LABELS_FR);
        expect(pickLabels(null)).toBe(LABELS_FR);
        expect(pickLabels('')).toBe(LABELS_FR);
        expect(pickLabels('fr')).toBe(LABELS_FR);
        expect(pickLabels('fr-FR')).toBe(LABELS_FR);
        expect(pickLabels('es')).toBe(LABELS_FR);
        expect(pickLabels('de')).toBe(LABELS_FR);
    });

    test('returns English dictionary for en-based language codes', () => {
        expect(pickLabels('en')).toBe(LABELS_EN);
        expect(pickLabels('en-US')).toBe(LABELS_EN);
        expect(pickLabels('en-GB')).toBe(LABELS_EN);
        expect(pickLabels('EN')).toBe(LABELS_EN);
    });

    test('both dictionaries define the three skins (archive, cinematic, editorial)', () => {
        const skins = ['archive', 'cinematic', 'editorial'];
        skins.forEach(skin => {
            expect(LABELS_FR[skin]).toBeDefined();
            expect(LABELS_EN[skin]).toBeDefined();
        });
    });

    test('both dictionaries share matching key structures across all skins', () => {
        ['archive', 'cinematic', 'editorial'].forEach(skin => {
            const frKeys = Object.keys(LABELS_FR[skin]).sort();
            const enKeys = Object.keys(LABELS_EN[skin]).sort();
            expect(enKeys).toEqual(frKeys);
        });

        const frThemes = Object.keys(LABELS_FR.archive.themes).sort();
        const enThemes = Object.keys(LABELS_EN.archive.themes).sort();
        expect(enThemes).toEqual(frThemes);

        const frMobileTabs = Object.keys(LABELS_FR.archive.mobileTabs).sort();
        const enMobileTabs = Object.keys(LABELS_EN.archive.mobileTabs).sort();
        expect(enMobileTabs).toEqual(frMobileTabs);
    });
});
