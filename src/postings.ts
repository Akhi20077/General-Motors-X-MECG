import type { RateGroup } from "./data";

/** Public Indeed salary pages. Base pay from postings, not a fringed hour. Read November 15, 2026. */
export type Posting = {
  state: string;
  place: string;
  scope: "state" | "city" | "national";
  role: RateGroup;
  title: string;
  avg: number;
  low: number;
  high: number;
  unit: "hour" | "year";
  n: number;
  updated: string;
  url: string;
  note?: string;
};

export const POSTINGS: Posting[] = [
  {
    state: "GA",
    place: "Georgia",
    scope: "state",
    role: "direct",
    title: "Production worker",
    avg: 15.36,
    low: 10.56,
    high: 22.35,
    unit: "hour",
    n: 581,
    updated: "Nov 8, 2026",
    url: "https://www.indeed.com/career/production-worker/salaries/GA",
  },
  {
    state: "MD",
    place: "Maryland",
    scope: "state",
    role: "direct",
    title: "Production worker",
    avg: 19.65,
    low: 15,
    high: 29.36,
    unit: "hour",
    n: 104,
    updated: "Jun 13, 2026",
    url: "https://www.indeed.com/career/production-worker/salaries/MD",
  },
  {
    state: "MI",
    place: "Michigan",
    scope: "state",
    role: "direct",
    title: "Factory worker",
    avg: 17.41,
    low: 13.9,
    high: 21.82,
    unit: "hour",
    n: 15,
    updated: "Oct 29, 2026",
    url: "https://www.indeed.com/career/factory-worker/salaries/MI",
    note: "Small sample. Indeed’s title here is factory worker, not production worker.",
  },
  {
    state: "OH",
    place: "Ohio",
    scope: "state",
    role: "direct",
    title: "Factory worker",
    avg: 15.41,
    low: 11.67,
    high: 20.34,
    unit: "hour",
    n: 60,
    updated: "Oct 27, 2026",
    url: "https://www.indeed.com/career/factory-worker/salaries/OH",
    note: "Indeed’s title here is factory worker, not production worker.",
  },
  {
    state: "NC",
    place: "North Carolina",
    scope: "state",
    role: "direct",
    title: "Production",
    avg: 15.91,
    low: 8.5,
    high: 29.77,
    unit: "hour",
    n: 284,
    updated: "Jun 27, 2026",
    url: "https://www.indeed.com/career/production/salaries/NC",
    note: "Indeed category is “Production,” broader than production worker.",
  },
  {
    state: "PA",
    place: "Pittsburgh, PA",
    scope: "city",
    role: "direct",
    title: "Production worker",
    avg: 17.13,
    low: 13.13,
    high: 22.34,
    unit: "hour",
    n: 28,
    updated: "May 20, 2026",
    url: "https://www.indeed.com/career/production-worker/salaries/Pittsburgh--PA",
    note: "City page. A statewide Pennsylvania production-worker page was not in the public results.",
  },
  {
    state: "US",
    place: "United States",
    scope: "national",
    role: "indirect",
    title: "Material handler",
    avg: 19.34,
    low: 15.25,
    high: 24.53,
    unit: "hour",
    n: 50700,
    updated: "Nov 8, 2026",
    url: "https://www.indeed.com/career/material-handler/salaries",
  },
  {
    state: "GA",
    place: "Atlanta, GA",
    scope: "city",
    role: "indirect",
    title: "Material handler",
    avg: 20.53,
    low: 14.44,
    high: 29.17,
    unit: "hour",
    n: 143,
    updated: "Jun 15, 2026",
    url: "https://www.indeed.com/career/material-handler/salaries/Atlanta--GA",
  },
  {
    state: "MI",
    place: "Brighton, MI",
    scope: "city",
    role: "indirect",
    title: "Material handler",
    avg: 19.76,
    low: 17.14,
    high: 22.79,
    unit: "hour",
    n: 20,
    updated: "Jun 14, 2026",
    url: "https://www.indeed.com/career/material-handler/salaries/Brighton--MI",
    note: "City page, not a Michigan statewide average.",
  },
  {
    state: "MI",
    place: "Michigan",
    scope: "state",
    role: "salaried",
    title: "Manufacturing engineer",
    avg: 94441,
    low: 62648,
    high: 142368,
    unit: "year",
    n: 426,
    updated: "Nov 7, 2026",
    url: "https://www.indeed.com/career/manufacturing-engineer/salaries/MI",
  },
];

const ROLE_RANK: Record<Posting["scope"], number> = { state: 0, city: 1, national: 2 };

/** Prefer a state page, then a city in that state, then a national page for the same role. */
export function bestPosting(state: string, role: RateGroup) {
  const rows = POSTINGS.filter((row) => row.role === role && (row.state === state || row.state === "US"));
  return rows.sort((a, b) => {
    const aLocal = a.state === state ? 0 : 1;
    const bLocal = b.state === state ? 0 : 1;
    return aLocal - bLocal || ROLE_RANK[a.scope] - ROLE_RANK[b.scope] || b.n - a.n;
  })[0];
}
