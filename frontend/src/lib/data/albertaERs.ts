// frontend/src/lib/data/albertaERs.ts
// Mirrors backend snapshot for dashboard display. Source: AHS, HQCA.

export const ALBERTA_ER_HOSPITALS = [
  {
    key: 'uofa',
    name: 'University of Alberta Hospital',
    city: 'Edmonton',
    waitMinutes: 316,
    lwbsRate: 0.151,
  },
  {
    key: 'royalAlexandra',
    name: 'Royal Alexandra Hospital',
    city: 'Edmonton',
    waitMinutes: 291,
    lwbsRate: 0.199,
  },
  {
    key: 'greyNuns',
    name: 'Grey Nuns Community Hospital',
    city: 'Edmonton',
    waitMinutes: 159,
    lwbsRate: 0.134,
  },
  {
    key: 'misericordia',
    name: 'Misericordia Community Hospital',
    city: 'Edmonton',
    waitMinutes: 367,
    lwbsRate: 0.172,
  },
  {
    key: 'sturgeon',
    name: 'Sturgeon Community Hospital',
    city: 'St. Albert',
    waitMinutes: 341,
    lwbsRate: 0.093,
  },
] as const;

export type AlbertaERKey = (typeof ALBERTA_ER_HOSPITALS)[number]['key'];
