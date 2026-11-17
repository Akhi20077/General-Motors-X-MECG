/** October 9, 2026 East Coast research vintage. Figures are nominal USD. */

export const VINTAGE = "October 9, 2026";
export const CONTRACT_EXPIRY = "April 30, 2028";

/** ECEC union manufacturing, June 2026. Ratios are unrounded so the build hits the published totals. */
export const ECEC_WAGE = 34.15;
export const ECEC_LEAVE = 4.41;
export const ECEC_LEGAL = 4.26;

export const DEFAULTS = {
  cola: 1.73,
  health: 9.52,
  leaveRatio: ECEC_LEAVE / ECEC_WAGE,
  legalRatio: ECEC_LEGAL / ECEC_WAGE,
  retirementRate: 0.1,
  postEmployment: 1,
  profitShare: 10500,
  paidHours: 2080,
  workedHours: 1840,
  healthBand: 4,
  quarterlyCola: 0.2,
};

/** Top hourly base, UAW–GM national schedule, effective September 21, 2026. Excludes COLA. */
export const TOP_BASE = {
  direct: 39.21,
  skilled: 46.33,
} as const;

export const LEVELS = [
  { id: "entry", label: "Entry", detail: "Year 1 · 70% of top", pct: 0.7 },
  { id: "y2", label: "Year 2", detail: "75% after 52 weeks", pct: 0.75 },
  { id: "y3", label: "Year 3", detail: "85% after 104 weeks", pct: 0.85 },
  { id: "top", label: "Top rate", detail: "After 156 weeks", pct: 1 },
] as const;

export type LevelId = (typeof LEVELS)[number]["id"];
export type RateGroup = "direct" | "skilled" | "indirect" | "salaried";

/**
 * Forecast quarters after the June 2026 COLA float.
 * September 2027 is both a COLA step and the final 5% general wage increase.
 * Six steps land near the research illustration of about $2.90 by early 2028.
 */
export const QUARTERS = [
  { q: 0, label: "Jun 2026", note: "Current float" },
  { q: 1, label: "Sep 2026", note: "COLA step" },
  { q: 2, label: "Dec 2026", note: "COLA step" },
  { q: 3, label: "Mar 2027", note: "COLA step" },
  { q: 4, label: "Jun 2027", note: "COLA step" },
  { q: 5, label: "Sep 2027", note: "5% raise + COLA" },
  { q: 6, label: "Early 2028", note: "Illustrated float" },
] as const;

export const GWI_QUARTER = 5;
export const GWI_RATE = 0.05;

export type StateBench = {
  abbr: string;
  name: string;
  wage: number;
  total: number;
  unionPct: number | null;
  unemployment: number | null;
  rpp: number | null;
  role: string;
};

/**
 * All-manufacturing production workers, BLS SAE Table 3, 2025 annual average.
 * Total uses the ECEC all-manufacturing benefits ratio (×1.496), not the GM contract build.
 * Union density, unemployment, and price level are filled only where the October 9 research published them.
 */
export const STATES: StateBench[] = [
  { abbr: "CT", name: "Connecticut", wage: 29.75, total: 44.51, unionPct: 16.1, unemployment: 5.1, rpp: null, role: "Wage benchmark" },
  { abbr: "MA", name: "Massachusetts", wage: 29.45, total: 44.06, unionPct: 14.5, unemployment: 4.3, rpp: null, role: "Wage benchmark" },
  { abbr: "MI", name: "Michigan", wage: 29.0, total: 43.38, unionPct: 13.0, unemployment: 5.0, rpp: 96.2, role: "GM home market" },
  { abbr: "NY", name: "New York", wage: 28.79, total: 43.07, unionPct: 21.3, unemployment: 4.3, rpp: 107.9, role: "GM UAW plants" },
  { abbr: "VA", name: "Virginia", wage: 28.52, total: 42.67, unionPct: 5.4, unemployment: 3.6, rpp: 101.1, role: "UAW truck" },
  { abbr: "DE", name: "Delaware", wage: 28.47, total: 42.59, unionPct: 10.4, unemployment: 4.7, rpp: null, role: "Wage benchmark" },
  { abbr: "SC", name: "South Carolina", wage: 27.96, total: 41.83, unionPct: 2.7, unemployment: 4.1, rpp: 93.7, role: "Nonunion OEMs" },
  { abbr: "MD", name: "Maryland", wage: 27.39, total: 40.98, unionPct: 12.7, unemployment: 4.1, rpp: 105.0, role: "UAW truck / powertrain" },
  { abbr: "PA", name: "Pennsylvania", wage: 27.3, total: 40.84, unionPct: 10.9, unemployment: 3.7, rpp: 97.6, role: "UAW truck" },
  { abbr: "NJ", name: "New Jersey", wage: 26.69, total: 39.93, unionPct: 14.7, unemployment: 4.3, rpp: 108.8, role: "Wage benchmark" },
  { abbr: "GA", name: "Georgia", wage: 24.57, total: 36.76, unionPct: 5.1, unemployment: 3.2, rpp: 96.3, role: "Nonunion OEMs" },
  { abbr: "NC", name: "North Carolina", wage: 23.5, total: 35.16, unionPct: 2.5, unemployment: 3.5, rpp: 94.3, role: "UAW truck" },
  { abbr: "FL", name: "Florida", wage: 30.27, total: 45.28, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "ME", name: "Maine", wage: 28.97, total: 43.34, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "NH", name: "New Hampshire", wage: 28.26, total: 42.28, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "OH", name: "Ohio", wage: 27.41, total: 41.01, unionPct: null, unemployment: null, rpp: null, role: "Sister-plant state" },
  { abbr: "WI", name: "Wisconsin", wage: 27.35, total: 40.92, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "KY", name: "Kentucky", wage: 27.19, total: 40.68, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "VT", name: "Vermont", wage: 26.91, total: 40.26, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "AL", name: "Alabama", wage: 25.99, total: 38.88, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "RI", name: "Rhode Island", wage: 25.95, total: 38.82, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "IN", name: "Indiana", wage: 25.69, total: 38.43, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "WV", name: "West Virginia", wage: 25.03, total: 37.44, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "TN", name: "Tennessee", wage: 24.62, total: 36.83, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "AK", name: "Alaska", wage: 22.0, total: 32.91, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "AZ", name: "Arizona", wage: 27.35, total: 40.92, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "AR", name: "Arkansas", wage: 23.83, total: 35.65, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "CA", name: "California", wage: 32.78, total: 49.04, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "CO", name: "Colorado", wage: 33.69, total: 50.4, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "HI", name: "Hawaii", wage: 30.52, total: 45.66, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "ID", name: "Idaho", wage: 26.01, total: 38.91, unionPct: null, unemployment: null, rpp: null, role: "Project brief" },
  { abbr: "IL", name: "Illinois", wage: 27.3, total: 40.84, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "IA", name: "Iowa", wage: 25.63, total: 38.34, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "KS", name: "Kansas", wage: 23.78, total: 35.57, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "LA", name: "Louisiana", wage: 31.4, total: 46.97, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "MN", name: "Minnesota", wage: 30.68, total: 45.9, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "MS", name: "Mississippi", wage: 23.28, total: 34.83, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "MO", name: "Missouri", wage: 27.55, total: 41.21, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "MT", name: "Montana", wage: 25.3, total: 37.85, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "NE", name: "Nebraska", wage: 26.47, total: 39.6, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "NV", name: "Nevada", wage: 24.79, total: 37.09, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "NM", name: "New Mexico", wage: 25.57, total: 38.25, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "ND", name: "North Dakota", wage: 27.11, total: 40.56, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "OK", name: "Oklahoma", wage: 25.47, total: 38.1, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "OR", name: "Oregon", wage: 29.95, total: 44.81, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "SD", name: "South Dakota", wage: 25.49, total: 38.13, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "TX", name: "Texas", wage: 31.47, total: 47.08, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "UT", name: "Utah", wage: 26.98, total: 40.36, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "WA", name: "Washington", wage: 35.34, total: 52.87, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
  { abbr: "WY", name: "Wyoming", wage: 33.66, total: 50.36, unionPct: null, unemployment: null, rpp: null, role: "Manufacturing benchmark" },
];

export const STATE_MIN = Math.min(...STATES.map((s) => s.total));
export const STATE_MAX = Math.max(...STATES.map((s) => s.total));

export function stateByAbbr(abbr: string) {
  return STATES.find((s) => s.abbr === abbr);
}

export function extremeState(kind: "low" | "high") {
  return STATES.reduce((best, state) =>
    kind === "low" ? (state.total < best.total ? state : best) : state.total > best.total ? state : best,
  );
}

export type Facility = {
  id: string;
  state: string;
  name: string;
  employer: string;
  union: string;
  kind: "gm" | "uaw-gap" | "nonunion";
  jobs: string;
  note: string;
  source: string;
};

export const FACILITIES: Facility[] = [
  {
    id: "tonawanda",
    state: "NY",
    name: "Tonawanda Propulsion",
    employer: "General Motors",
    union: "UAW Local 774",
    kind: "gm",
    jobs: "870",
    note: "V8 engines. National UAW–GM rate card. Long-tenured plant, so the pension vs 401(k) mix matters most here.",
    source: "NY Governor, May 27, 2025; UAW–GM highlights",
  },
  {
    id: "lockport",
    state: "NY",
    name: "Lockport Components",
    employer: "General Motors",
    union: "UAW Locals 686 and 55",
    kind: "gm",
    jobs: "1,500+",
    note: "Radiators, HVAC, EV stators. GMCH tier moved to the main production rate in the 2023 agreement.",
    source: "GM via The EV Report; UAW–GM highlights",
  },
  {
    id: "rochester",
    state: "NY",
    name: "Rochester Operations",
    employer: "General Motors",
    union: "UAW Local 1097",
    kind: "gm",
    jobs: "~600",
    note: "Engine and battery-cooling parts. Headcount is before 2025 layoff reports. Confirm no local rate exception.",
    source: "WHEC; UAW–GM highlights",
  },
  {
    id: "daimler",
    state: "NC",
    name: "Cleveland, Mount Holly, Gastonia, Thomas Built",
    employer: "Daimler Truck",
    union: "UAW · about 7,400 members",
    kind: "uaw-gap",
    jobs: "~7,400",
    note: "Contract runs to March 3, 2028. 25%+ raises, first COLA, and profit sharing. Dollar scale is not public.",
    source: "Daimler Truck North America, May 6, 2024",
  },
  {
    id: "mack",
    state: "PA",
    name: "Lehigh Valley and Hagerstown",
    employer: "Mack Trucks",
    union: "UAW · about 3,900 members",
    kind: "uaw-gap",
    jobs: "~3,900",
    note: "Five-year deal ratified November 2023. About 19–20% compounded. No COLA. Dollar scale is not public. Also covers Maryland sites.",
    source: "Heavy Duty Trucking; Michigan Advance",
  },
  {
    id: "volvo",
    state: "VA",
    name: "New River Valley, Dublin",
    employer: "Volvo Trucks",
    union: "UAW Local 2069",
    kind: "uaw-gap",
    jobs: "~2,900",
    note: "Six-year deal ratified July 2021, which implies a 2027 expiry. Date still needs a local confirmation.",
    source: "Automotive World",
  },
  {
    id: "daimler-ga",
    state: "GA",
    name: "Atlanta Parts Distribution Center",
    employer: "Daimler Truck",
    union: "UAW",
    kind: "uaw-gap",
    jobs: "—",
    note: "Same 2024 agreement as the North Carolina plants. Dollar wage scale is not public.",
    source: "Daimler Truck North America, May 6, 2024",
  },
  {
    id: "mack-md",
    state: "MD",
    name: "Hagerstown and Baltimore",
    employer: "Mack / Volvo",
    union: "UAW",
    kind: "uaw-gap",
    jobs: "—",
    note: "Covered with the Mack five-year agreement. No COLA. Dollar scale is not public. Baltimore GM Operations has had no new work since 2019.",
    source: "Heavy Duty Trucking; Baltimore Fishbowl",
  },
  {
    id: "hyundai",
    state: "GA",
    name: "Metaplant America",
    employer: "Hyundai",
    union: "Nonunion",
    kind: "nonunion",
    jobs: "—",
    note: "Production entry reported at $22.40 in 2024. Maintenance starts at $30.70. Company committed to a 25% production raise by 2028. Fully loaded entry is modeled at $32.80 with the nonunion manufacturing benefits ratio.",
    source: "GPB, July 2024; Hyundai, November 13, 2023",
  },
];

export const HYUNDAI = {
  wage: 22.4,
  benefits: 10.4,
  total: 32.8,
  year: 2024,
  label: "Hyundai Metaplant entry, 2024",
};

/** BLS ECEC Table 5, June 2026, released September 9, 2026. Dollars per hour worked. */
export const ECEC = {
  union: {
    label: "Union manufacturing",
    wages: 34.15,
    leave: 4.41,
    supplemental: 3.85,
    insurance: 9.52,
    retirement: 3.04,
    legal: 4.26,
    total: 59.23,
    benefitPct: 0.734,
  },
  nonunion: {
    label: "Nonunion manufacturing",
    wages: 32.3,
    leave: 3.54,
    supplemental: 2.47,
    insurance: 4.12,
    retirement: 1.42,
    legal: 3.44,
    total: 47.28,
    benefitPct: 0.464,
  },
};

export const COLA_HISTORY = [
  { label: "Sep 2024", value: 0.66 },
  { label: "Jun 2025", value: 0.95 },
  { label: "Next step", value: 1.18 },
  { label: "Jun 2026", value: 1.73 },
];

export const SOURCES = [
  { group: "Contract", items: [
    "UAW–GM 2023 Hourly Highlighter — wage schedule, progression, COLA, benefits (November 2023)",
    "UAW Local 276 GM Chairperson’s Report, June 2026 — COLA float $1.73",
    "UAW Local 276 report, June 2025 — COLA float $0.95",
  ]},
  { group: "Government", items: [
    "BLS ECEC, June 2026, Tables 4, 5, and 7 — benefit cost per hour",
    "BLS SAE Table 3, 2025 annual average — production employees on manufacturing payrolls, all 50 states. Fully loaded total is that wage × 1.496.",
    "BLS OEWS, May 2023 — industrial engineers (SOC 17-2112), state mean hourly wage. BLS does not publish a separate manufacturing-engineer wage. Alaska has no published estimate for this occupation.",
    "BLS ECEC Table 4, June 2025 — private industry, professional and related occupations. Benefits $21.33 on a $48.88 wage, applied to the state engineer wage.",
    "BLS Union Members 2025 — state union density",
    "BLS LAUS — state unemployment, August 2026",
    "BLS CPI, August 2026 — CPI-W +3.5%, the COLA driver",
    "BEA Regional Price Parities via FRED",
    "FOMC statement and projections, September 16, 2026",
  ]},
  { group: "Company and trade press", items: [
    "Daimler Truck North America UAW agreements, May 6, 2024",
    "GPB — Hyundai Metaplant pay, July 2024",
    "GM Authority — 2025 profit sharing ($10,500, down from $14,500)",
    "Motor1 — GM estimate that the 2023 labor deals add $9.3 billion through 2028",
    "Heavy Duty Trucking and Automotive World — Mack and Volvo contracts",
  ]},
];

export const DICTIONARY = [
  { metric: "Base wage", unit: "$ / hour", denominator: "Straight-time hour", confidence: "High", source: "UAW–GM highlights. Top production $39.21 and skilled $46.33 on September 21, 2026. Same card at every covered plant." },
  { metric: "COLA float", unit: "$ / hour", denominator: "Added to base; counts toward overtime and paid time off", confidence: "High", source: "UAW Local 276, June 2026. Quarterly from CPI-W less medical care, minus a 10¢ diversion. Never below zero." },
  { metric: "Paid leave", unit: "$ / hour worked", denominator: "ECEC union-manufacturing leave ÷ wages", confidence: "Modeled", source: "Contract provides about 17.7 holidays a year and up to 200 vacation hours at 20+ years. Dollar line uses the ECEC ratio, not a plant time-clock." },
  { metric: "Legally required", unit: "$ / hour worked", denominator: "ECEC union-manufacturing legally required ÷ wages", confidence: "Modeled", source: "FICA, unemployment insurance, and workers’ compensation. Actual UI and workers’ comp rates are state-set; this line is a national proxy." },
  { metric: "Health insurance", unit: "$ / hour worked", denominator: "Flat dollars, not a percent of wage", confidence: "Modeled · widest band", source: "ECEC union-manufacturing insurance, $9.52. Contract bars premium, copay, and deductible increases. GM has not published the plant cost. Moves the total about ±$3 to $5." },
  { metric: "401(k)", unit: "$ / hour", denominator: "10% of base, capped at 40 hours a week", confidence: "Verified rate", source: "In-progression (post-2007) hires. Legacy traditional workers keep a pension. That hourly cost is not published." },
  { metric: "Retiree health", unit: "$ / hour worked", denominator: "Flat $1.00", confidence: "Verified", source: "UAW–GM national agreement." },
  { metric: "Fully fringed rate", unit: "$ / hour worked", denominator: "Wage + COLA + benefits. Profit sharing excluded.", confidence: "Medium", source: "Wage is high confidence. The total is medium because health is a proxy." },
  { metric: "Profit sharing", unit: "$ / year, also $ / paid hour", denominator: "$1,000 per $1 billion of GM North America pretax profit", confidence: "Contingent", source: "2025 plan year $10,500 ($5.05 at 2,080 paid hours). 2024 was $14,500. Kept out of the base rate." },
  { metric: "State manufacturing total", unit: "$ / hour", denominator: "2025 production wage × 1.496", confidence: "Medium", source: "BLS state wages and the ECEC all-manufacturing benefits ratio. Mixes union and nonunion, and all manufacturing, not auto-specific." },
];
