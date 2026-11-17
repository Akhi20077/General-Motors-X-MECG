/**
 * Industrial engineers, SOC 17-2112. BLS does not publish a separate
 * manufacturing-engineer wage; this is the occupation that covers production systems.
 * Mean hourly wage, OEWS state estimates, May 2023.
 */
export type EngineerWage = {
  abbr: string;
  wage: number;
  annual: number;
  employment: number;
};

export const ENGINEER = {
  soc: "17-2112",
  title: "Industrial engineer",
  vintage: "May 2023",
  source: "BLS OEWS state estimates, May 2023",
} as const;

/** ECEC Table 4, June 2025. Private industry, professional and related occupations. */
export const SALARIED_BENEFIT = {
  wage: 48.88,
  benefits: 21.33,
  vintage: "June 2025",
  source: "BLS ECEC Table 4, private industry, professional and related occupations",
} as const;

export const SALARIED_LOAD = SALARIED_BENEFIT.benefits / SALARIED_BENEFIT.wage;

export const ENGINEERS: EngineerWage[] = [
  { abbr: "AL", wage: 46.98, annual: 97730, employment: 7440 },
  { abbr: "AZ", wage: 52.48, annual: 109150, employment: 7100 },
  { abbr: "AR", wage: 45.28, annual: 94180, employment: 1850 },
  { abbr: "CA", wage: 58.15, annual: 120960, employment: 24640 },
  { abbr: "CO", wage: 51.76, annual: 107660, employment: 5230 },
  { abbr: "CT", wage: 49.4, annual: 102740, employment: 6190 },
  { abbr: "DE", wage: 52.3, annual: 108780, employment: 800 },
  { abbr: "FL", wage: 52.81, annual: 109850, employment: 13130 },
  { abbr: "GA", wage: 47.59, annual: 99000, employment: 7440 },
  { abbr: "HI", wage: 57.77, annual: 120150, employment: 40 },
  { abbr: "ID", wage: 54.37, annual: 113080, employment: 1770 },
  { abbr: "IL", wage: 49.38, annual: 102710, employment: 17760 },
  { abbr: "IN", wage: 45.29, annual: 94210, employment: 10910 },
  { abbr: "IA", wage: 46.67, annual: 97060, employment: 4610 },
  { abbr: "KS", wage: 48.43, annual: 100740, employment: 3370 },
  { abbr: "KY", wage: 43.76, annual: 91010, employment: 6020 },
  { abbr: "LA", wage: 60.83, annual: 126520, employment: 2020 },
  { abbr: "MA", wage: 53.99, annual: 112290, employment: 11370 },
  { abbr: "MD", wage: 56.95, annual: 118460, employment: 2910 },
  { abbr: "ME", wage: 46.45, annual: 96610, employment: 750 },
  { abbr: "MI", wage: 47.92, annual: 99680, employment: 27470 },
  { abbr: "MN", wage: 49.65, annual: 103280, employment: 18760 },
  { abbr: "MS", wage: 43.37, annual: 90220, employment: 1990 },
  { abbr: "MO", wage: 47.73, annual: 99270, employment: 5390 },
  { abbr: "MT", wage: 47.49, annual: 98780, employment: 480 },
  { abbr: "NE", wage: 45.19, annual: 93990, employment: 1520 },
  { abbr: "NV", wage: 51.96, annual: 108070, employment: 980 },
  { abbr: "NC", wage: 46.44, annual: 96600, employment: 10200 },
  { abbr: "NH", wage: 49.01, annual: 101940, employment: 1720 },
  { abbr: "NM", wage: 55.53, annual: 115500, employment: 800 },
  { abbr: "NJ", wage: 50.08, annual: 104170, employment: 6910 },
  { abbr: "NY", wage: 49.22, annual: 102370, employment: 12330 },
  { abbr: "ND", wage: 41.61, annual: 86540, employment: 550 },
  { abbr: "OH", wage: 47.22, annual: 98220, employment: 19230 },
  { abbr: "OK", wage: 47.79, annual: 99410, employment: 2340 },
  { abbr: "OR", wage: 50.87, annual: 105810, employment: 4060 },
  { abbr: "PA", wage: 44.33, annual: 92200, employment: 13310 },
  { abbr: "RI", wage: 53.15, annual: 110560, employment: 1000 },
  { abbr: "SC", wage: 45.99, annual: 95660, employment: 7070 },
  { abbr: "SD", wage: 45.35, annual: 94320, employment: 870 },
  { abbr: "TN", wage: 46.07, annual: 95820, employment: 6710 },
  { abbr: "TX", wage: 52.69, annual: 109590, employment: 24390 },
  { abbr: "UT", wage: 49.11, annual: 102160, employment: 4310 },
  { abbr: "VA", wage: 50.97, annual: 106030, employment: 5120 },
  { abbr: "VT", wage: 47.46, annual: 98710, employment: 500 },
  { abbr: "WA", wage: 55.2, annual: 114810, employment: 5820 },
  { abbr: "WI", wage: 42.47, annual: 88340, employment: 12270 },
  { abbr: "WV", wage: 49.27, annual: 102480, employment: 830 },
  { abbr: "WY", wage: 56.81, annual: 118160, employment: 240 },
];

export function engineerByAbbr(abbr: string) {
  return ENGINEERS.find((row) => row.abbr === abbr);
}

export function salariedCost(wage: number) {
  const benefits = wage * SALARIED_LOAD;
  return { wage, benefits, total: wage + benefits };
}
