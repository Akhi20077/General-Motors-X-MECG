import { useMemo, useState } from "react";
import {
  COLA_HISTORY,
  CONTRACT_EXPIRY,
  DEFAULTS,
  DICTIONARY,
  ECEC,
  ECEC_LEGAL,
  ECEC_LEAVE,
  ECEC_WAGE,
  FACILITIES,
  HYUNDAI,
  LEVELS,
  QUARTERS,
  SOURCES,
  STATES,
  STATE_MAX,
  STATE_MIN,
  VINTAGE,
  stateByAbbr,
  type RateGroup,
  type StateBench,
} from "./data";
import { MAP_PINS, MAP_STATES, MAP_VIEW } from "./mapPaths";
import {
  INITIAL,
  buildRate,
  cents,
  judgeQuote,
  money,
  pct,
  type Build,
  type Scenario,
} from "./model";

const GROUPS: { id: RateGroup; label: string; live: boolean }[] = [
  { id: "direct", label: "Direct", live: true },
  { id: "skilled", label: "Skilled trades", live: true },
  { id: "indirect", label: "Indirect", live: false },
  { id: "salaried", label: "Salaried", live: false },
];

const LARGE = new Set(["MI", "NY", "PA", "OH", "VA", "NC", "SC", "GA", "IN", "WI", "KY", "TN", "FL", "AL", "WV"]);

export default function App() {
  const [scenario, setScenario] = useState<Scenario>(INITIAL);
  const [copied, setCopied] = useState(false);

  const patch = (partial: Partial<Scenario>) => setScenario((s) => ({ ...s, ...partial }));
  const modeled: "direct" | "skilled" = scenario.group === "skilled" ? "skilled" : "direct";
  const gap = scenario.group === "indirect" || scenario.group === "salaried";
  const selected = stateByAbbr(scenario.stateAbbr);

  const rate = useMemo(() => buildRate(scenario, modeled), [scenario, modeled]);
  const ladder = useMemo(
    () => LEVELS.map((level) => buildRate({ ...scenario, level: level.id }, modeled)),
    [scenario, modeled],
  );
  const forecast = useMemo(
    () => QUARTERS.map((q) => ({ ...q, rate: buildRate({ ...scenario, quarter: q.q }, modeled) })),
    [scenario, modeled],
  );
  const quoteValue = Number.parseFloat(scenario.quote);
  const flag = judgeQuote(quoteValue, rate);
  const note = narrative(rate, selected, scenario);
  const baseline = isBaseline(scenario, modeled);

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <header className="top">
        <div className="top-row">
          <div className="brand">
            <div className="mark">MECG</div>
            <div>
              <p className="eyebrow">Michigan Engineering Consulting Group · General Motors</p>
              <h1>Fringe Cost Dashboard</h1>
            </div>
          </div>
          <p className="vintage">
            Factory labor rates
            <span>Research vintage {VINTAGE}</span>
          </p>
        </div>
        <nav className="jump">
          <a href="#rate">Rate</a>
          <a href="#regions">Regions</a>
          <a href="#compare">Compare</a>
          <a href="#forecast">Forecast</a>
          <a href="#quote">Quote check</a>
          <a href="#sources">Sources</a>
        </nav>
      </header>

      <main className="page">
        <aside className="rail">
          <section className="card">
            <h2>Scenario</h2>
            <p className="lede">
              These inputs rebuild the UAW–GM hour. State benchmarks stay at the published vintage.
            </p>
            <div className="seg" role="group" aria-label="Labor group">
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  className={scenario.group === g.id ? "on" : ""}
                  aria-pressed={scenario.group === g.id}
                  onClick={() => patch({ group: g.id })}
                >
                  {g.label}
                  {!g.live && <em>Gap</em>}
                </button>
              ))}
            </div>
            <div className="seg levels" role="group" aria-label="Wage level">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  className={scenario.level === level.id ? "on" : ""}
                  aria-pressed={scenario.level === level.id}
                  onClick={() => patch({ level: level.id })}
                >
                  {level.label}
                </button>
              ))}
            </div>
            <Slider
              label="COLA float"
              hint="June 2026 verified float is $1.73. Later quarters add the step below."
              min={0}
              max={4}
              step={0.01}
              value={scenario.cola}
              onChange={(cola) => patch({ cola })}
              format={(v) => money(v)}
            />
            <Slider
              label="Quarterly COLA step"
              hint="About 20¢ net if CPI-W stays near 3.5% a year. This is an illustration, not a GM forecast."
              min={0}
              max={0.5}
              step={0.01}
              value={scenario.quarterlyCola}
              onChange={(quarterlyCola) => patch({ quarterlyCola })}
              format={(v) => money(v)}
            />
            <Slider
              label="Forecast point"
              hint={QUARTERS[scenario.quarter].note}
              min={0}
              max={6}
              step={1}
              value={scenario.quarter}
              onChange={(quarter) => patch({ quarter })}
              format={(v) => QUARTERS[v].label}
            />
            <Slider
              label="Health insurance"
              hint="Flat per hour worked. Largest uncertainty in the total."
              min={4}
              max={16}
              step={0.01}
              value={scenario.health}
              onChange={(health) => patch({ health })}
              format={(v) => money(v)}
            />
            <Slider
              label="Health sensitivity"
              hint="Draws the band around the rate. The memo puts this near ±$3 to $5."
              min={0}
              max={8}
              step={0.5}
              value={scenario.healthBand}
              onChange={(healthBand) => patch({ healthBand })}
              format={(v) => `±${money(v)}`}
            />
            <Slider
              label="Paid leave"
              hint={`ECEC union manufacturing, ${money(ECEC_LEAVE)} / ${money(ECEC_WAGE)}.`}
              min={0}
              max={0.25}
              step={0.0001}
              value={scenario.leaveRatio}
              onChange={(leaveRatio) => patch({ leaveRatio })}
              format={(v) => pct(v, 2)}
            />
            <Slider
              label="Payroll taxes & workers' comp"
              hint={`ECEC legally required, ${money(ECEC_LEGAL)} / ${money(ECEC_WAGE)}. State rates differ.`}
              min={0}
              max={0.25}
              step={0.0001}
              value={scenario.legalRatio}
              onChange={(legalRatio) => patch({ legalRatio })}
              format={(v) => pct(v, 2)}
            />
            <Slider
              label="401(k) of base"
              hint="In-progression hires. Legacy pensions are a separate unpublished cost."
              min={0}
              max={0.2}
              step={0.005}
              value={scenario.retirementRate}
              onChange={(retirementRate) => patch({ retirementRate })}
              format={(v) => pct(v, 1)}
            />
            <Slider
              label="Retiree health"
              min={0}
              max={3}
              step={0.05}
              value={scenario.postEmployment}
              onChange={(postEmployment) => patch({ postEmployment })}
              format={(v) => money(v)}
            />
            <Slider
              label="Profit sharing, annual"
              hint="$10,500 is the 2025 plan year. $14,500 was 2024. Kept out of the base rate."
              min={0}
              max={20000}
              step={100}
              value={scenario.profitShare}
              onChange={(profitShare) => patch({ profitShare })}
              format={(v) => money(v, 0)}
            />
            <Slider
              label="Paid hours"
              hint="Turns the annual payout into a per-hour layer."
              min={1800}
              max={2200}
              step={10}
              value={scenario.paidHours}
              onChange={(paidHours) => patch({ paidHours })}
              format={(v) => v.toLocaleString("en-US")}
            />
            <Slider
              label="Hours worked"
              hint="Annualizes the fully fringed hour. Default 1,840 assumes about 240 hours of holiday and vacation."
              min={1500}
              max={2200}
              step={10}
              value={scenario.workedHours}
              onChange={(workedHours) => patch({ workedHours })}
              format={(v) => v.toLocaleString("en-US")}
            />
            <div className="presets">
              <button onClick={() => setScenario(INITIAL)}>October baseline</button>
              <button onClick={() => patch({ health: 13.52, quarter: 0, group: "direct", level: "top" })}>
                Health +$4
              </button>
              <button onClick={() => patch({ quarter: 6, group: "direct", level: "top" })}>Early 2028 path</button>
              <button onClick={() => patch({ profitShare: 14500 })}>2024 profit sharing</button>
            </div>
          </section>
        </aside>

        <div className="stack">
          <section id="rate" className="card hero">
            {gap && (
              <p className="banner">
                {scenario.group === "indirect" ? "Indirect labor" : "Salaried plant support"} is in the
                project brief and not in this vintage. No rate is invented for it. The figures below stay
                on {modeled === "skilled" ? "skilled trades" : "direct labor"}.
              </p>
            )}
            <div className="hero-top">
              <div>
                <p className="kicker">Fully fringed rate · profit sharing excluded</p>
                <p className="figure">{money(rate.total)}</p>
                <p className="per">per hour worked</p>
              </div>
              <dl className="stats">
                <div>
                  <dt>Wage + COLA</dt>
                  <dd>{money(rate.wage)}</dd>
                </div>
                <div>
                  <dt>Benefits</dt>
                  <dd>{money(rate.benefits)}</dd>
                </div>
                <div>
                  <dt>Benefits / wages</dt>
                  <dd>{pct(rate.benefitPct)}</dd>
                </div>
                <div>
                  <dt>With profit sharing</dt>
                  <dd>{money(rate.withProfit)}</dd>
                </div>
              </dl>
            </div>
            <p className="who">
              {LEVELS.find((l) => l.id === rate.level)?.detail} · {modeled === "skilled" ? "Skilled trades" : "Direct production"} · UAW–GM national agreement
              {rate.gwiApplied ? " · September 2027 5% general wage increase is in the base" : ""}
            </p>
            <p className="band">
              Health-cost band {money(rate.low)} – {money(rate.high)}. Wage confidence is high. The total is medium because health is an ECEC proxy, not GM’s plant cost.
            </p>
            <div className="stackbar" aria-hidden="true">
              <Stack rate={rate} />
            </div>
            <ul className="swatches">
              <li><i className="sw base" /> Base</li>
              <li><i className="sw cola" /> COLA</li>
              <li><i className="sw leave" /> Leave</li>
              <li><i className="sw legal" /> Taxes</li>
              <li><i className="sw health" /> Health</li>
              <li><i className="sw retire" /> 401(k)</li>
              <li><i className="sw post" /> Retiree health</li>
            </ul>
            <Bridge rate={rate} />
            <div className="split">
              <p>
                Annualized at {scenario.workedHours.toLocaleString("en-US")} hours worked: <strong>{money(rate.annual, 0)}</strong> before profit sharing, <strong>{money(rate.annualWithProfit, 0)}</strong> with the {money(scenario.profitShare, 0)} payout.
              </p>
              <p>
                {scenario.quarter === 0
                  ? `COLA is still a float. It folds into base, less 5¢, at expiry on ${CONTRACT_EXPIRY}. Move the forecast point to see that opening base.`
                  : <>On this forecast point, folding the float into base less 5¢ produces an opening base of <strong>{money(rate.foldedBase)}</strong>. Contract ends {CONTRACT_EXPIRY}.</>}
              </p>
            </div>
            {baseline && (
              <p className="cross">
                Cross-check at this baseline: applying the ECEC union-manufacturing benefit ratio (73.4%) to the $40.94 wage gives $71.01, next to $70.82 with the 2025 profit-sharing layer.
              </p>
            )}
            <div className="note-row">
              <p className="note">{note}</p>
              <button className="copy" onClick={copyNote}>{copied ? "Copied" : "Copy note"}</button>
            </div>
          </section>

          <section className="card">
            <h2>Wage ladder</h2>
            <p className="lede">
              Same national card at Tonawanda, Lockport, Rochester, Flint, and Detroit. Progression was cut from eight years to three.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Base</th>
                    <th>COLA</th>
                    <th>Wage</th>
                    <th>Benefits</th>
                    <th>Fully fringed</th>
                    <th>With profit sharing</th>
                    <th>Benefits / wages</th>
                  </tr>
                </thead>
                <tbody>
                  {ladder.map((row) => (
                    <tr key={row.level} className={row.level === scenario.level ? "picked" : ""}>
                      <td>{LEVELS.find((l) => l.id === row.level)?.label}</td>
                      <td>{money(row.base)}</td>
                      <td>{money(row.cola)}</td>
                      <td>{money(row.wage)}</td>
                      <td>{money(row.benefits)}</td>
                      <td>{money(row.total)}</td>
                      <td>{money(row.withProfit)}</td>
                      <td>{pct(row.benefitPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="regions" className="card">
            <div className="section-head">
              <h2>Regions</h2>
              <p className="lede">
                Color is the 2025 all-manufacturing production total, not the GM rate. GM’s UAW wage is national, so New York and Michigan plants share one card. The state average is who else is hiring.
              </p>
            </div>
            <div className="region-grid">
              <RegionMap abbr={scenario.stateAbbr} onPick={(stateAbbr) => patch({ stateAbbr })} />
              <StateDetail abbr={scenario.stateAbbr} bench={selected} gm={rate.total} />
            </div>
            <RankTable abbr={scenario.stateAbbr} onPick={(stateAbbr) => patch({ stateAbbr })} />
          </section>

          <section id="compare" className="card">
            <h2>Compare</h2>
            <p className="lede">
              Read the label before the bar. These are not the same worker, the same year, or the same benefit package.
            </p>
            <Compare rate={rate} bench={selected} />
            <EcecSplit />
            <div className="gap-grid">
              {FACILITIES.filter((f) => f.kind !== "gm").map((f) => (
                <article key={f.id} className={`gap-card ${f.kind}`}>
                  <p className="kicker">{f.state} · {f.union}</p>
                  <h3>{f.employer}</h3>
                  <p className="gap-name">{f.name}</p>
                  <p>{f.note}</p>
                  <p className="src">{f.source}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="forecast" className="card">
            <h2>Path to the 2028 talks</h2>
            <p className="lede">
              One raise is left in the contract, 5% in September 2027. After that, wage growth until expiry comes from COLA. The shaded band is the health sensitivity at every point.
            </p>
            <ForecastChart points={forecast} active={scenario.quarter} />
            <p className="map-key">
              <span><i className="sw base" /> Fully fringed</span>
              <span><i className="sw cola" /> Wage + COLA</span>
              <span><i className="sw low" /> Health-cost band</span>
            </p>
            <div className="cola-row">
              <div>
                <h3>COLA already printed</h3>
                <ol className="cola">
                  {COLA_HISTORY.map((c) => (
                    <li key={c.label}>
                      <span>{c.label}</span>
                      <strong>{money(c.value)}</strong>
                    </li>
                  ))}
                </ol>
              </div>
              <p>
                CPI-W rose 3.5% in the year to August 2026. The June step was 55¢. A rough rule from that step is about 1¢ of COLA per 0.09 CPI-W point, before the 10¢ quarterly health diversion. Volvo NRV (about 2027), Daimler Truck (March 3, 2028), and the Detroit Three (April 30, 2028) expire within roughly 15 months of each other.
              </p>
            </div>
          </section>

          <section id="quote" className="card">
            <h2>Supplier quote check</h2>
            <p className="lede">
              Paste a fully fringed hourly quote. The flag locates it against this scenario’s GM band and the published state range. It is a screen, not a statistical confidence interval.
            </p>
            <div className="quote-box">
              <label>
                Quoted fully fringed rate
                <input
                  inputMode="decimal"
                  value={scenario.quote}
                  onChange={(e) => patch({ quote: e.target.value })}
                />
              </label>
              <div className="presets">
                {[
                  ["32.80", "Hyundai entry"],
                  ["43.07", "NY manufacturing"],
                  ["49.85", "GM entry"],
                  ["65.77", "GM top"],
                  ["80", "High quote"],
                ].map(([value, label]) => (
                  <button key={value} onClick={() => patch({ quote: value })}>{label}</button>
                ))}
              </div>
            </div>
            <QuoteRuler quote={quoteValue} rate={rate} />
            <p className={`flag flag-${flag.tone}`}>
              <strong>{flag.title}</strong>
              {flag.detail}
            </p>
          </section>

          <section id="sources" className="card">
            <h2>Rate dictionary</h2>
            <div className="table-wrap">
              <table className="dict">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Unit</th>
                    <th>Confidence</th>
                    <th>What it is</th>
                  </tr>
                </thead>
                <tbody>
                  {DICTIONARY.map((row) => (
                    <tr key={row.metric}>
                      <td>{row.metric}</td>
                      <td>{row.unit}</td>
                      <td><span className="chip">{row.confidence}</span></td>
                      <td>{row.source}<span className="denom">{row.denominator}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className="later">Sources in this vintage</h2>
            <div className="source-grid">
              {SOURCES.map((group) => (
                <div key={group.group}>
                  <h3>{group.group}</h3>
                  <ul>
                    {group.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <h2 className="later">Still open</h2>
            <ul className="open">
              <li>GM’s actual health-insurance cost per hour, and the traditional vs in-progression mix at the three New York plants.</li>
              <li>Dollar wage scales for Daimler, Mack, and Volvo.</li>
              <li>Indirect labor and salaried plant support. The brief asks for both. This vintage does not have them.</li>
              <li>Plant-level Michigan and Ohio rates beyond the national UAW card, plus Detroit, Flint, Prudenville, and Idaho from the project brief.</li>
              <li>Industry cuts for plastic molding, assembly, and just-in-time. Current rows are auto contract rates and all-manufacturing averages.</li>
              <li>A live BLS pull. Phase D asks for it. This version cites a fixed vintage so every number can be traced.</li>
            </ul>
          </section>
        </div>
      </main>
      <footer className="foot">
        <p>MECG × GM · Project 1, factory labor rates · Prepared for purchasing and cost engineering</p>
        <p>Akhi Kanmanthreddy, project manager · Luisa Bruno Ferré · Daniel Okoye · Kyle Fu · Vivaan Sandwar</p>
      </footer>
    </>
  );
}

function isBaseline(s: Scenario, modeled: "direct" | "skilled") {
  return (
    modeled === "direct" &&
    s.level === "top" &&
    s.quarter === 0 &&
    s.cola === DEFAULTS.cola &&
    s.health === DEFAULTS.health &&
    s.leaveRatio === DEFAULTS.leaveRatio &&
    s.legalRatio === DEFAULTS.legalRatio &&
    s.retirementRate === DEFAULTS.retirementRate &&
    s.postEmployment === DEFAULTS.postEmployment &&
    s.profitShare === DEFAULTS.profitShare &&
    s.paidHours === DEFAULTS.paidHours
  );
}

function narrative(rate: Build, state: StateBench | undefined, s: Scenario) {
  const level = LEVELS.find((l) => l.id === rate.level)?.label.toLowerCase();
  const who = rate.group === "skilled" ? "skilled-trades" : "production";
  const market = state
    ? `${state.name}'s all-manufacturing production average is ${money(state.wage)} an hour and ${money(state.total)} fully loaded. That average mixes industries and union status. The GM figure is the national UAW card, so it is the same in ${state.name} and in Michigan.`
    : `${s.stateAbbr} does not have a manufacturing-wage row in the ${VINTAGE} vintage.`;
  return `A ${level} UAW–GM ${who} worker costs ${money(rate.total)} per hour worked before profit sharing. Wages are ${money(rate.wage)} (${money(rate.base)} base plus ${money(rate.cola)} COLA) and benefits are ${money(rate.benefits)}, ${pct(rate.benefitPct)} of wages. Health insurance is ${money(rate.health)}; moving it by ${money(s.healthBand)} puts the hour between ${money(rate.low)} and ${money(rate.high)}. Profit sharing of ${money(s.profitShare, 0)} adds ${money(rate.profitPerHour)} per paid hour and stays out of the base rate. At ${s.workedHours.toLocaleString("en-US")} hours worked the year is about ${money(rate.annual, 0)} before that payout. ${market}`;
}

function Slider({
  label,
  hint,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
}) {
  return (
    <label className="slider">
      <span className="slider-top">
        <span>{label}</span>
        <span className="slider-value">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <span className="hint">{hint}</span> : null}
    </label>
  );
}

function Stack({ rate }: { rate: Build }) {
  const parts = [
    ["base", rate.base],
    ["cola", rate.cola],
    ["leave", rate.leave],
    ["legal", rate.legal],
    ["health", rate.health],
    ["retire", rate.retirement],
    ["post", rate.postEmployment],
  ] as const;
  return (
    <>
      {parts.map(([name, value]) => (
        <span key={name} className={name} style={{ width: `${(value / rate.total) * 100}%` }} />
      ))}
    </>
  );
}

function Bridge({ rate }: { rate: Build }) {
  const rows = [
    ["Base wage", rate.base, "Verified"],
    ["COLA", rate.cola, "Verified"],
    ["Paid leave", rate.leave, "Modeled"],
    ["Payroll taxes & workers' comp", rate.legal, "Modeled"],
    ["Health insurance", rate.health, "Modeled"],
    ["401(k) on base", rate.retirement, "Verified rate"],
    ["Retiree health", rate.postEmployment, "Verified"],
  ] as const;
  return (
    <div className="bridge">
      {rows.map(([name, value, tag]) => (
        <div key={name} className="bridge-row">
          <span>{name}</span>
          <span className="tag">{tag}</span>
          <span>{money(value)}</span>
        </div>
      ))}
      <div className="bridge-row total">
        <span>Fully fringed</span>
        <span className="tag">Medium</span>
        <span>{money(rate.total)}</span>
      </div>
      <div className="bridge-row aside">
        <span>Profit sharing, kept separate</span>
        <span className="tag">Contingent</span>
        <span>{money(rate.profitPerHour)}</span>
      </div>
      <p className="hint bridge-hint">
        Lines round to the cent. The fully fringed total is rounded from the unrounded sum, so the lines can differ from it by a cent. With profit sharing the hour is {money(rate.withProfit)}.
      </p>
    </div>
  );
}

function fillFor(total: number) {
  const t = Math.min(1, Math.max(0, (total - STATE_MIN) / (STATE_MAX - STATE_MIN)));
  const a = [246, 226, 168];
  const b = [0, 39, 76];
  return a.map((channel, i) => Math.round(channel + (b[i] - channel) * t));
}

function RegionMap({ abbr, onPick }: { abbr: string; onPick: (abbr: string) => void }) {
  const pins = MAP_PINS.map((pin, index) => {
    const stacked = MAP_PINS.findIndex(
      (other, otherIndex) => otherIndex < index && Math.hypot(other.x - pin.x, other.y - pin.y) < 10,
    );
    return stacked >= 0 ? { ...pin, x: pin.x + 8, y: pin.y - 7 } : pin;
  });

  return (
    <div className="map-wrap">
      <svg viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`} role="img" aria-label="Eastern United States and Michigan labor markets">
        {MAP_STATES.map((state) => {
          const bench = stateByAbbr(state.abbr);
          const rgb = bench ? fillFor(bench.total) : [230, 223, 210];
          const ink = bench && rgb[2] < 120 ? "#f7f4ee" : "#1c1915";
          const showRate = bench && LARGE.has(state.abbr);
          return (
            <g
              key={state.abbr}
              className={abbr === state.abbr ? "shape on" : "shape"}
              onClick={() => onPick(state.abbr)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(state.abbr);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={bench ? `${state.name}, ${money(bench.total)} fully loaded manufacturing` : state.name}
              aria-pressed={abbr === state.abbr}
            >
              <path d={state.d} style={{ fill: `rgb(${rgb.join(",")})` }} />
              <text x={state.x} y={showRate ? state.y - 6 : state.y} fill={ink} textAnchor="middle">
                {state.abbr}
              </text>
              {showRate && bench ? (
                <text x={state.x} y={state.y + 12} fill={ink} textAnchor="middle" className="rate-label">
                  {cents(bench.total).toFixed(0)}
                </text>
              ) : null}
            </g>
          );
        })}
        {pins.map((pin) => (
          <g key={pin.name} className="pin">
            <circle cx={pin.x} cy={pin.y} r="4.5" />
            <title>{pin.name}</title>
          </g>
        ))}
      </svg>
      <p className="map-key">
        <span><i className="sw low" /> Lower state total</span>
        <span><i className="sw high" /> Higher state total</span>
        <span><i className="dot" /> Plant in the file</span>
        <span>Gray states are in the map for geography and have no wage row yet.</span>
      </p>
    </div>
  );
}

function StateDetail({ abbr, bench, gm }: { abbr: string; bench: StateBench | undefined; gm: number }) {
  const sites = FACILITIES.filter((f) => f.state === abbr);
  return (
    <div className="detail">
      <p className="kicker">{bench ? bench.role : "Outside this vintage"}</p>
      <h3>{bench ? bench.name : MAP_STATES.find((s) => s.abbr === abbr)?.name ?? abbr}</h3>
      {bench ? (
        <>
          <p className="detail-rate">{money(bench.total)} <span>manufacturing, fully loaded</span></p>
          <dl className="detail-stats">
            <div><dt>Production wage</dt><dd>{money(bench.wage)}</dd></div>
            <div><dt>Union members</dt><dd>{bench.unionPct.toFixed(1)}%</dd></div>
            <div><dt>Unemployment</dt><dd>{bench.unemployment.toFixed(1)}%</dd></div>
            <div><dt>Price level</dt><dd>{bench.rpp ?? "Not pulled"}</dd></div>
          </dl>
          <p className="vs">
            The GM scenario rate is {money(gm)}, {money(gm - bench.total)} above this state average. The gap is expected: one number is a national auto contract, the other is every manufacturing production job in the state.
          </p>
          {abbr === "MI" && (
            <p className="vs">
              Flint and Detroit UAW–GM production wages match Tonawanda. The $29.00 Michigan figure is the all-manufacturing average, not the GM plant rate. Ohio, Prudenville, and Idaho are still open research items.
            </p>
          )}
        </>
      ) : (
        <p className="vs">
          {abbr === "OH"
            ? "Ohio is the sister-plant comparison the brief asks for. The UAW–GM card would match New York. The state manufacturing average is not in the October 9 dataset."
            : "This state is drawn so the region is readable. It does not have a wage row in the October 9 East Coast vintage."}
        </p>
      )}
      {sites.length > 0 && (
        <ul className="sites">
          {sites.map((site) => (
            <li key={site.id}>
              <strong>{site.name}</strong>
              <span>{site.employer} · {site.union} · {site.jobs} jobs</span>
              <span>{site.note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RankTable({ abbr, onPick }: { abbr: string; onPick: (abbr: string) => void }) {
  const ranked = [...STATES].sort((a, b) => b.total - a.total);
  return (
    <div className="table-wrap rank">
      <table>
        <thead>
          <tr>
            <th>Band</th>
            <th>State</th>
            <th>Wage</th>
            <th>Fully loaded</th>
            <th>Union</th>
            <th>Unemployment</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((state, index) => (
            <tr
              key={state.abbr}
              className={state.abbr === abbr ? "picked" : ""}
              onClick={() => onPick(state.abbr)}
            >
              <td>{index < 4 ? "High" : index < 8 ? "Mid" : "Low"}</td>
              <td>{state.name}</td>
              <td>{money(state.wage)}</td>
              <td>{money(state.total)}</td>
              <td>{state.unionPct.toFixed(1)}%</td>
              <td>{state.unemployment.toFixed(1)}%</td>
              <td>{state.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Compare({ rate, bench }: { rate: Build; bench: StateBench | undefined }) {
  const rows = [
    { label: "This GM scenario", note: "Contract build, profit sharing out", value: rate.total, tone: "gm" },
    { label: "GM plus profit sharing", note: "Contingent layer", value: rate.withProfit, tone: "gm" },
    bench
      ? { label: `${bench.name} manufacturing`, note: "2025 average × 1.496", value: bench.total, tone: "state" }
      : null,
    { label: "Connecticut, high state", note: "Top of this vintage", value: STATE_MAX, tone: "state" },
    { label: "North Carolina, low state", note: "Bottom of this vintage", value: STATE_MIN, tone: "state" },
    { label: "Hyundai entry, 2024", note: "Nonunion, low confidence", value: HYUNDAI.total, tone: "other" },
    { label: "ECEC union manufacturing", note: "June 2026, all union plants", value: ECEC.union.total, tone: "other" },
    { label: "ECEC nonunion manufacturing", note: "June 2026", value: ECEC.nonunion.total, tone: "other" },
  ].filter((row): row is { label: string; note: string; value: number; tone: string } => row !== null);
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <div className="bars">
      {rows.map((row) => (
        <div key={row.label} className="bar-row">
          <div>
            <strong>{row.label}</strong>
            <span>{row.note}</span>
          </div>
          <div className="track">
            <span className={row.tone} style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
          <b>{money(row.value)}</b>
        </div>
      ))}
    </div>
  );
}

function EcecSplit() {
  const parts = [
    ["leave", "Leave"],
    ["supplemental", "Supplemental pay"],
    ["insurance", "Insurance"],
    ["retirement", "Retirement"],
    ["legal", "Legally required"],
  ] as const;
  return (
    <div className="ecec">
      <h3>Why the fringe gap is mostly benefits</h3>
      <p>Union manufacturing benefits were 73.4% of wages in June 2026. Nonunion benefits were 46.4%. Insurance was 2.3× and retirement was 2.1×.</p>
      {(["union", "nonunion"] as const).map((key) => {
        const row = ECEC[key];
        const benefit = row.leave + row.supplemental + row.insurance + row.retirement + row.legal;
        return (
          <div key={key} className="ecec-row">
            <span>{row.label}</span>
            <div className="mini">
              {parts.map(([part, label]) => (
                <span key={part} className={part} style={{ width: `${(row[part] / benefit) * 100}%` }} title={`${label} ${money(row[part])}`} />
              ))}
            </div>
            <b>{money(row.total)}</b>
          </div>
        );
      })}
    </div>
  );
}

function ForecastChart({
  points,
  active,
}: {
  points: { q: number; label: string; rate: Build }[];
  active: number;
}) {
  const w = 720;
  const h = 260;
  const pad = { l: 52, r: 16, t: 18, b: 40 };
  const low = Math.min(...points.map((p) => p.rate.wage));
  const high = Math.max(...points.map((p) => p.rate.high));
  const y0 = Math.floor(low / 5) * 5 - 5;
  const y1 = Math.ceil(high / 5) * 5;
  const x = (i: number) => pad.l + (i / (points.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - y0) / (y1 - y0)) * (h - pad.t - pad.b);
  const band = [
    ...points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.rate.high).toFixed(1)}`),
    ...points.map(
      (_, i) =>
        `L${x(points.length - 1 - i).toFixed(1)} ${y(points[points.length - 1 - i].rate.low).toFixed(1)}`,
    ),
    "Z",
  ].join(" ");
  const line = (key: "total" | "wage") =>
    points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.rate[key]).toFixed(1)}`).join(" ");
  const ticks: number[] = [];
  for (let tick = y0; tick <= y1; tick += 5) ticks.push(tick);

  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Forecast of the fully fringed rate through early 2028">
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={pad.l} x2={w - pad.r} y1={y(tick)} y2={y(tick)} />
          <text x={pad.l - 8} y={y(tick) + 4} textAnchor="end">{tick}</text>
        </g>
      ))}
      <path d={band} className="band" />
      <path d={line("wage")} className="wage-line" />
      <path d={line("total")} className="total-line" />
      {points.map((point, i) => (
        <g key={point.q}>
          <line x1={x(i)} x2={x(i)} y1={y(point.rate.total)} y2={h - pad.b} className={point.q === active ? "guide on" : "guide"} />
          <circle cx={x(i)} cy={y(point.rate.total)} r={point.q === active ? 5 : 3.5} className="total-dot" />
          <text x={x(i)} y={h - 14} textAnchor={i === points.length - 1 ? "end" : "middle"}>
            {point.label === "Early 2028" ? "2028" : point.label.replace(" 20", " ")}
          </text>
        </g>
      ))}
    </svg>
  );
}

function QuoteRuler({ quote, rate }: { quote: number; rate: Build }) {
  const min = 30;
  const max = 90;
  const pos = (v: number) => `${((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100}%`;
  const valid = Number.isFinite(quote);
  return (
    <div className="ruler">
      <div className="ruler-track">
        <span className="zone state" style={{ left: pos(STATE_MIN), width: `calc(${pos(STATE_MAX)} - ${pos(STATE_MIN)})` }} />
        <span className="zone gm" style={{ left: pos(rate.low), width: `calc(${pos(rate.high)} - ${pos(rate.low)})` }} />
        {valid && <span className="needle" style={{ left: pos(quote) }} />}
      </div>
      <div className="ruler-labels">
        <span>{money(min, 0)}</span>
        <span>State band {money(STATE_MIN)}–{money(STATE_MAX)}</span>
        <span>GM band</span>
        <span>{money(max, 0)}</span>
      </div>
    </div>
  );
}
