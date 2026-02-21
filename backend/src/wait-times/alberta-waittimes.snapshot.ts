// backend/src/wait-times/alberta-waittimes.snapshot.ts

export const ALBERTA_WAITTIMES_SNAPSHOT = {
  source: "Alberta Health Services Wait Times",
  sourceUrl: "https://www.albertahealthservices.ca/waittimes/waittimes.aspx",
  snapshotTakenAt: "2026-02-20T22:30:00-07:00",
  hospitals: {
    uofa: {
      key: "uofa",
      name: "University of Alberta Hospital",
      city: "Edmonton",
      waitMinutes: 316,
    },
    royalAlexandra: {
      key: "royalAlexandra",
      name: "Royal Alexandra Hospital",
      city: "Edmonton",
      waitMinutes: 291,
    },
    greyNuns: {
      key: "greyNuns",
      name: "Grey Nuns Community Hospital",
      city: "Edmonton",
      waitMinutes: 159,
    },
    misericordia: {
      key: "misericordia",
      name: "Misericordia Community Hospital",
      city: "Edmonton",
      waitMinutes: 367,
    },
    sturgeon: {
      key: "sturgeon",
      name: "Sturgeon Community Hospital",
      city: "St. Albert",
      waitMinutes: 341,
    },
  },
} as const;

export type AlbertaHospitalKey =
  keyof typeof ALBERTA_WAITTIMES_SNAPSHOT.hospitals;
