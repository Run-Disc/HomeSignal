"use client";

import { useState } from "react";
import context from "../../data/public/housing-context.json";

export function HousingContext() {
  const [month, setMonth] = useState("2025-12");
  const rent = context.zillow.monthly.find((row) => row.month === month)!;
  const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  return (
    <details className="activity-panel housing-context">
      <summary><strong>Housing context: rents & community</strong><span>Compare definitions before comparing numbers</span></summary>
      <p>Three lenses on housing, with different coverage. These fixed regional and city indicators do not change when you filter the permit queue by neighborhood.</p>
      <div className="context-grid">
        <article className="card">
          <p className="eyebrow">Market · Pittsburgh metro</p>
          <h3>Observed market rent</h3>
          <label htmlFor="rent-month">Rent month</label>
          <select id="rent-month" value={month} onChange={(event) => setMonth(event.target.value)}>
            {context.zillow.monthly.map((row) => <option key={row.month} value={row.month}>{new Date(`${row.month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</option>)}
          </select>
          <div className="metric-value" aria-live="polite">{dollars(rent.value)}</div>
          <p>Zillow Observed Rent Index (ZORI), smoothed, all homes plus multifamily. A typical market-rate rent index; not the rent paid by every tenant.</p>
          <a href={context.zillow.sourceUrl} target="_blank" rel="noreferrer">Zillow Research source</a>
        </article>
        <article className="card">
          <p className="eyebrow">Community · Pittsburgh city · 2020–2024</p>
          <h3>Median gross rent</h3>
          <div className="metric-value">{dollars(context.census.medianGrossRent)}</div>
          <p>Census survey estimate over five years. Gross rent includes relevant utility costs. This is not a monthly asking-rent series.</p>
          <h3>Same home one year earlier</h3>
          <div className="metric-value">{context.census.sameHouseOneYearAgoPercent}%</div>
          <p>People age 1 and older, not households. This does not measure displacement or net migration.</p>
          <a href={context.census.sourceUrl} target="_blank" rel="noreferrer">Census QuickFacts source</a>
        </article>
      </div>
      <h3>How we reconcile the sources</h3>
      <div className="table-wrap"><table>
        <thead><tr><th>Source</th><th>Geography & period</th><th>Meaning</th><th>Safe comparison</th></tr></thead>
        <tbody>
          <tr><td>City PLI</td><td>City / reported neighborhood; 2025 issue dates</td><td>Administrative permit records</td><td>Monthly activity within this source; not completed homes.</td></tr>
          <tr><td>Zillow ZORI</td><td>Metro area; monthly 2025</td><td>Modeled market-rent index in dollars</td><td>Change within this same metro series; not a neighborhood rent estimate.</td></tr>
          <tr><td>Census QuickFacts</td><td>City; pooled 2020–2024 survey estimates</td><td>Gross rent and residential stability</td><td>Background context; not a 2025 monthly measure.</td></tr>
        </tbody>
      </table></div>
      <p><strong>No forced join:</strong> we preserve each source’s geography, period, and definition. We do not subtract these rent measures, attribute metro rents to neighborhoods, or claim permits caused a rent change.</p>
      <p><strong>What is missing:</strong> we lack reliable linked completion, occupancy, household-flow, displacement, and neighborhood affordability data. HomeSignal does not claim to answer those questions.</p>
      <p className="muted">Retrieved {context.retrievedAt}. Zillow historical values may be revised; this is a frozen extract retrieved on that date. {context.census.uncertainty} Context remains separate from permit-review exports.</p>
    </details>
  );
}
