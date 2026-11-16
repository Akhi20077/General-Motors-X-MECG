import {
  DEFAULTS,
  GWI_QUARTER,
  GWI_RATE,
  HYUNDAI,
  LEVELS,
  STATE_MAX,
  STATE_MIN,
  TOP_BASE,
  type LevelId,
  type RateGroup,
} from "./data";

export type Scenario = {
  group: RateGroup;
  level: LevelId;
  quarter: number;
  stateAbbr: string;
  cola: number;
  health: number;
  leaveRatio: number;
  legalRatio: number;
  retirementRate: number;
  postEmployment: number;
  profitShare: number;
  paidHours: number;
  workedHours: number;
  healthBand: number;
  quarterlyCola: number;
  quote: string;
};

export const INITIAL: Scenario = {
  group: "direct",
  level: "top",
  quarter: 0,
  stateAbbr: "NY",
  cola: DEFAULTS.cola,
  health: DEFAULTS.health,
  leaveRatio: DEFAULTS.leaveRatio,
  legalRatio: DEFAULTS.legalRatio,
  retirementRate: DEFAULTS.retirementRate,
  postEmployment: DEFAULTS.postEmployment,
  profitShare: DEFAULTS.profitShare,
  paidHours: DEFAULTS.paidHours,
  workedHours: DEFAULTS.workedHours,
  healthBand: DEFAULTS.healthBand,
  quarterlyCola: DEFAULTS.quarterlyCola,
  quote: "58",
};

export type Build = {
  group: "direct" | "skilled";
  level: LevelId;
  base: number;
  cola: number;
  wage: number;
  leave: number;
  legal: number;
  health: number;
  retirement: number;
  postEmployment: number;
  benefits: number;
  total: number;
  low: number;
  high: number;
  profitPerHour: number;
  withProfit: number;
  benefitPct: number;
  annual: number;
  annualWithProfit: number;
  gwiApplied: boolean;
  foldedBase: number;
};

export function cents(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function money(n: number, digits = 2) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

/** Fully fringed UAW–GM hour. Profit sharing is returned beside the rate, not inside it. */
export function buildRate(
  input: Pick<
    Scenario,
    | "level"
    | "quarter"
    | "cola"
    | "health"
    | "leaveRatio"
    | "legalRatio"
    | "retirementRate"
    | "postEmployment"
    | "profitShare"
    | "paidHours"
    | "workedHours"
    | "healthBand"
    | "quarterlyCola"
  >,
  group: "direct" | "skilled",
): Build {
  const level = LEVELS.find((l) => l.id === input.level) ?? LEVELS[3];
  const gwiApplied = input.quarter >= GWI_QUARTER;
  const top = TOP_BASE[group] * (gwiApplied ? 1 + GWI_RATE : 1);
  // Contract rates are published to the cent (75% of $39.21 is printed as $29.41).
  const base = cents(top * level.pct);
  const cola = input.cola + input.quarter * input.quarterlyCola;
  const wage = base + cola;
  const leave = wage * input.leaveRatio;
  const legal = wage * input.legalRatio;
  const health = input.health;
  const retirement = base * input.retirementRate;
  const postEmployment = input.postEmployment;
  const benefits = leave + legal + health + retirement + postEmployment;
  const total = wage + benefits;
  const profitPerHour = input.paidHours > 0 ? input.profitShare / input.paidHours : 0;
  const shown = cents(total);
  return {
    group,
    level: level.id,
    base,
    cola,
    wage,
    leave,
    legal,
    health,
    retirement,
    postEmployment,
    benefits,
    total,
    low: total - input.healthBand,
    high: total + input.healthBand,
    profitPerHour,
    withProfit: total + profitPerHour,
    benefitPct: wage > 0 ? benefits / wage : 0,
    annual: shown * input.workedHours,
    annualWithProfit: shown * input.workedHours + input.profitShare,
    gwiApplied,
    foldedBase: base + cola - 0.05,
  };
}

export type QuoteFlag = {
  tone: "low" | "region" | "between" | "near" | "high";
  title: string;
  detail: string;
};

export function judgeQuote(quote: number, rate: Build): QuoteFlag {
  const band = rate.high - rate.total;
  if (!Number.isFinite(quote)) {
    return {
      tone: "between",
      title: "Enter a fully fringed quote",
      detail: "Use dollars per hour worked, with benefits included. Include profit sharing only if the supplier folded it into the rate.",
    };
  }
  if (quote >= rate.low && quote <= rate.high) {
    return {
      tone: "near",
      title: "Inside the GM sensitivity band",
      detail: `${money(quote)} is within ${money(band)} of the modeled GM rate ${money(rate.total)}. Health cost is the line that moves this band. Compare components before treating it as a challenge.`,
    };
  }
  if (quote > rate.high) {
    return {
      tone: "high",
      title: "Above the GM band — ask for the build-up",
      detail: `${money(quote)} is ${money(quote - rate.total)} above the modeled fully fringed rate of ${money(rate.total)}, past the health-cost band. A rate this far from the baseline needs the supplier’s wage, benefit, and hour-basis backup.`,
    };
  }
  if (quote < HYUNDAI.total) {
    return {
      tone: "low",
      title: "Below the nonunion entry benchmark",
      detail: `${money(quote)} sits under the modeled Hyundai Metaplant entry rate of ${money(HYUNDAI.total)} (2024, low confidence). Ask which labor mix and which benefits are inside the quote.`,
    };
  }
  if (quote < STATE_MIN) {
    return {
      tone: "between",
      title: "Between nonunion entry and the state band",
      detail: `${money(quote)} is above the Hyundai entry benchmark and below the lowest state manufacturing total in this vintage (${money(STATE_MIN)} in North Carolina).`,
    };
  }
  if (quote <= STATE_MAX) {
    return {
      tone: "region",
      title: "Inside the regional manufacturing band",
      detail: `${money(quote)} falls between ${money(STATE_MIN)} in North Carolina and ${money(STATE_MAX)} in Connecticut. That band is all-manufacturing production work, not a UAW auto rate.`,
    };
  }
  return {
    tone: "between",
    title: "Above state averages, under the GM band",
    detail: `${money(quote)} is above every state manufacturing average here and below the GM sensitivity band of ${money(rate.low)}–${money(rate.high)}. That can fit a nonunion or lighter benefit package. It does not show that the quote matches a UAW–GM hour.`,
  };
}

function assertClose(actual: number, expected: number, label: string) {
  if (Math.abs(cents(actual) - expected) > 0.001) {
    throw new Error(`${label}: got ${cents(actual)}, expected ${expected}`);
  }
}

/** Locks the default build to the figures already shown to GM. */
export function assertPublishedTotals() {
  const base = {
    quarter: 0,
    cola: DEFAULTS.cola,
    health: DEFAULTS.health,
    leaveRatio: DEFAULTS.leaveRatio,
    legalRatio: DEFAULTS.legalRatio,
    retirementRate: DEFAULTS.retirementRate,
    postEmployment: DEFAULTS.postEmployment,
    profitShare: DEFAULTS.profitShare,
    paidHours: DEFAULTS.paidHours,
    workedHours: DEFAULTS.workedHours,
    healthBand: DEFAULTS.healthBand,
    quarterlyCola: DEFAULTS.quarterlyCola,
  };
  const top = buildRate({ ...base, level: "top" }, "direct");
  assertClose(top.wage, 40.94, "top wage");
  assertClose(top.benefits, 24.83, "top benefits");
  assertClose(top.total, 65.77, "top total");
  assertClose(top.profitPerHour, 5.05, "profit per hour");
  const entry = buildRate({ ...base, level: "entry" }, "direct");
  assertClose(entry.total, 49.85, "entry total");
  const y2 = buildRate({ ...base, level: "y2" }, "direct");
  assertClose(y2.total, 52.51, "year 2 total");
  const y3 = buildRate({ ...base, level: "y3" }, "direct");
  assertClose(y3.total, 57.81, "year 3 total");
  const skilled = buildRate({ ...base, level: "top" }, "skilled");
  assertClose(skilled.total, 75.41, "skilled total");
}

assertPublishedTotals();
