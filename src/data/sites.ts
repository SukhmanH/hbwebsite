/**
 * The valley run — every site H.B. Bro's farms, ordered north to south.
 * `km` marks the distance down the run from the Naramata home block.
 */
export interface VineyardSite {
  name: string;
  locality: string;
  km: number;
  soils: string;
  grapes: string[];
  note: string;
  variant: 'bench' | 'rows' | 'lake' | 'clay' | 'family' | 'harvest';
}

export const sites: VineyardSite[] = [
  {
    name: 'Naramata Bench',
    locality: 'Naramata',
    km: 0,
    soils: 'Clay and silt bluffs over Okanagan Lake',
    grapes: ['Pinot Gris', 'Chardonnay', 'Pinot Noir'],
    note:
      'The north end of our run and the coolest fruit we grow. Lake air keeps the afternoons honest, and the whites off this bench hold their acid deep into fall.',
    variant: 'lake',
  },
  {
    name: 'Skaha Bench',
    locality: 'Kaleden',
    km: 14,
    soils: 'Sandy loam over glacial till',
    grapes: ['Riesling', 'Gewürztraminer', 'Pinot Noir'],
    note:
      'A steep, east-facing bench above Skaha Lake. First light hits these rows before anywhere else we farm — aromatic whites do their best work here.',
    variant: 'bench',
  },
  {
    name: 'Okanagan Falls',
    locality: 'Okanagan Falls',
    km: 24,
    soils: 'Stony benches, quick-draining',
    grapes: ['Chardonnay', 'Merlot', 'Cabernet Franc'],
    note:
      'Rock and wind. The narrows between the lakes funnel a breeze through here most evenings, so the fruit stays clean and the skins come in thick.',
    variant: 'rows',
  },
  {
    name: 'Golden Mile Bench',
    locality: 'Oliver',
    km: 52,
    soils: 'Gravelly alluvial fans off the west hills',
    grapes: ['Cabernet Franc', 'Merlot', 'Sauvignon Blanc'],
    note:
      'West side of the valley, morning sun, cool early evenings. Structured reds with the kind of tannin winemakers ask us about by name.',
    variant: 'harvest',
  },
  {
    name: 'Black Sage Bench',
    locality: 'Oliver',
    km: 56,
    soils: 'Deep sand — some of the warmest dirt in Canada',
    grapes: ['Cabernet Sauvignon', 'Syrah', 'Merlot'],
    note:
      'The south end, where the desert really shows itself. Sagebrush at the row ends and heat units to spare. Big reds ripen here, fully and every year.',
    variant: 'clay',
  },
];

export const varieties = {
  whites: [
    'Pinot Gris',
    'Chardonnay',
    'Riesling',
    'Gewürztraminer',
    'Sauvignon Blanc',
    'Viognier',
  ],
  reds: [
    'Merlot',
    'Cabernet Sauvignon',
    'Cabernet Franc',
    'Syrah',
    'Pinot Noir',
    'Gamay Noir',
  ],
};
