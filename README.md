# Fringe cost

Fully fringed factory labor rates for GM purchasing.

A buyer can see what one UAW–GM hour costs, what sits inside the fringe, how East Coast and Michigan manufacturing averages compare, and whether a supplier quote is near that baseline or far enough to challenge.

## Run it

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## What this version answers

The October 9, 2026 research vintage is the dataset. The dashboard does not invent wages for categories that research left open.

- **Direct production and skilled trades** use the UAW–GM national schedule effective September 21, 2026. The same card applies at Tonawanda, Lockport, Rochester, Flint, and Detroit.
- **Fully fringed rate** = base + COLA + paid leave + payroll taxes and workers’ compensation + health + 401(k) + retiree health. Profit sharing is shown beside the rate, not inside it.
- **Default build** matches the figures already shared with GM: $65.77 for top production, $75.41 for top skilled trades, before profit sharing.
- **Scenario controls** move COLA, the quarterly COLA step, health cost, leave, legally required benefits, 401(k), retiree health, profit sharing, and hours.
- **Regions** color 2025 all-manufacturing production totals. That is a different population from the GM contract rate. Gray states are on the map for geography and do not have a wage row yet.
- **Quote check** places a supplier’s fully fringed hour against the GM health-cost band and the state range. It is a screen, not a statistical confidence interval.
- **Forecast** carries the rate to early 2028: quarterly COLA, then the September 2027 5% general wage increase. The 20¢ step is an illustration if CPI-W stays near 3.5%.

## How the fringe is built

| Line | Treatment | Label |
| --- | --- | --- |
| Base wage | Contract top × progression. Entry 70%, year 2 75%, year 3 85%, top 100%. | Verified |
| COLA | $1.73 at June 2026, plus the quarterly step on the forecast. | Verified float |
| Paid leave | Wage × ($4.41 / $34.15) from ECEC union manufacturing. | Modeled |
| Legally required | Wage × ($4.26 / $34.15). Actual unemployment and workers’ comp rates vary by state. | Modeled |
| Health | $9.52 per hour, flat. The widest uncertainty, about ±$3 to $5. | Modeled |
| 401(k) | 10% of base for in-progression hires. Legacy pensions are not in this rate. | Verified rate |
| Retiree health | $1.00 per hour. | Verified |
| Profit sharing | 2025 plan year $10,500, shown separately. $1,000 per $1 billion of GM North America pretax profit. | Contingent |

State manufacturing totals use the published 2025 production wage times 1.496, the ECEC all-manufacturing benefits ratio. They do not respond to the GM scenario sliders.

## Not in this vintage

Indirect labor, salaried plant support, plastic molding and just-in-time cuts, dollar scales for Daimler, Mack, and Volvo, GM’s actual health cost, and the pension share at Tonawanda. Ohio, Prudenville, and Idaho are called out as open rather than filled with estimated wages. A live BLS refresh is the next data step; this tool cites one vintage so every number can be traced.

## Sources

Contracts and union reports (UAW–GM 2023 Hourly Highlighter, UAW Local 276 COLA reports), BLS ECEC June 2026, BLS state wages and union membership, BEA regional price parities, and the company and trade-press sources listed in the dashboard.
