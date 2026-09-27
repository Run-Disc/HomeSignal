# Sources

Permit metrics come from the PLI snapshot below. Zillow and Census figures are separate context. Simulated runtime AI interprets one open permit row; it is not a data source and is not mixed into those metrics.

## PLI Permits (primary)

| Field | Value |
|---|---|
| Title | PLI Permits |
| Publisher | City of Pittsburgh, via Western Pennsylvania Regional Data Center |
| Landing | https://data.wprdc.org/dataset/pli-permits |
| Resource | https://data.wprdc.org/dataset/pli-permits/resource/f4d1177a-f597-4c32-8cbf-7885f56253f6 |
| Dump URL used | https://data.wprdc.org/datastore/dump/f4d1177a-f597-4c32-8cbf-7885f56253f6 |
| Resource ID | f4d1177a-f597-4c32-8cbf-7885f56253f6 |
| Retrieval | 2026-09-26 (CKAN dump; datastore_search `total` 65378) |
| Source last_modified | 2026-09-26T03:22:05.014160 |
| Package temporal_coverage | 2019-06-03/2026-09-21 |
| License metadata | Creative Commons Attribution (cc-by), http://www.opendefinition.org/licenses/cc-by |
| Downloaded rows | 65,378 |
| Catalog HTML preview_rows / total_record_count | 49,255 (inconsistent with the dump; HomeSignal uses the dump) |
| Product cohort | 4,243 unique 2025 Building / Building & Development Application records |
| Unique ID used | `permit_id` (string). Package notes mention `ext_file_num`; that field was not in the retrieved schema. No conflicting duplicate IDs in the 2025 Building/BDA subset. |
| Attribution | City of Pittsburgh PLI permit records published by WPRDC. |
| Fields kept | permit ID, permit type, source class, work type, issue date, current status, neighborhood, work description (privacy-reduced) |
| Transformations | Filter to 2025 issue dates and Building / BDA types; drop owner, contractor, address, parcel, coordinate, value, and contact fields; redact house-number street patterns in descriptions to `[REDACTED_ADDRESS]`; flag blank descriptions; mark keyword/work-type housing-queue candidates. Snapshot version `pli-2025-bda-v1`. When the app loads the snapshot, it hashes each sanitized record so saved reviews can be flagged stale if source text changes. |

**What one PLI row establishes:** the City issued a permit with this ID, type, class, work type, date, and neighborhood; the public description text; and the administrative status at retrieval.

**What it does not establish:** construction start or completion, occupancy, affordability or rents, net unit change, or whether several permits describe one project. Status is the current label, not a history of inspections.

The WPRDC resource HTML page displayed a Data Use Agreement. It was not accepted by the implementation agent. CKAN JSON API and dump retrieval used for this snapshot did not present an interactive accept step. If a browser terms gate appears for you, review it yourself before using that path.

## Official City context (not ingested as metrics)

- Permit classifications: https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting
- OneStopPGH permit center (human follow-up): https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/OneStopPGH-Permit-Center

## Related Pittsburgh tools (not this product)

HomeSignal does **not** claim that no comparable tools exist. These are different jobs.

| Resource | What it is | URL |
|---|---|---|
| OneStopPGH Insights guided tour | City public tool for maps, records, detailed views, and summary statistics across planning, zoning, permits, and related cases. HomeSignal adds a privacy-reduced source-quote review and briefing workflow rather than replacing this system. | https://insightshelp.pittsburghpa.gov/ |
| Pittsburgh Affordable Housing Development Project Explorer | City interactive maps, charts, and tables of affordable developments completed, under construction, in process, or in the pipeline (city announcement 17 April 2025). Not a PLI description-review workspace. | https://www.arcgis.com/apps/dashboards/603c22bb04ba4a478ad91d0758b7c262 |
| City announcement of the Explorer | Official press page for the tool | https://www.pittsburghpa.gov/News-articles/Homepage/KEEP-PITTSBURGH-HOME-Mayor-Ed-Gainey-Launches-Data-Transparency-Tool-Showing-Progress-on-Delivering-1600-units-of-Affordable-Housing-for-Pittsburghers |
| Office of the City Controller, *Special Report: Inclusionary Zoning and Affordable Housing Financing* (June 2025) | Recommends a City of Pittsburgh Housing Development Dashboard, or building on the Explorer, with citywide and neighborhood completed-unit and affordable-inventory metrics. HomeSignal does not implement that dashboard. | https://www.pittsburghpa.gov/files/assets/city/v/1/controller/documents/special-report-inclusionary-zoning-6.10.25.pdf |

HomeSignal’s job is a **privacy-reduced, evidence-first permit-description review**: keep exact quotes, keep permit records distinct from proposed units, and export a briefing. It is complementary to project maps and any future city housing dashboard.

## Zoning as future verification only (not ingested, not current output)

Checked 2026-09-26. HomeSignal does **not** load zoning layers, interpret Title 9, or score whether a permit is feasible. An analyst could open these later. Official pages state that Pittsburgh is divided into zoning districts that regulate potential uses; approval processes vary by project type, scope of work, and location; and **most building permits require zoning approval** (Record of Zoning Approval / ROZA), including some interior renovations that change use.

| Role | URL | Check |
|---|---|---|
| City Zoning page (Department of City Planning) | https://www.pittsburghpa.gov/Business-Development/City-Planning/Zoning | Fetched 200. Districts regulate potential uses; processes vary by type, scope, and location. |
| Zoning FAQ (ROZA) | https://www.pittsburghpa.gov/Business-Development/Zoning/Zoning-FAQ | Fetched 200. “Most building permits… require zoning approval… ROZA.” |
| Zoning Code (Title 9 on eCode360) | https://ecode360.com/45474054 | City FAQ: obtain the code on eCode360, Title Nine. Direct fetch is Cloudflare-gated; URL is the Title 9 landing from search/City guidance. |
| Catalog-supplied code URL (event packet) | https://pittsburghpa.gov/dcp/zoning-code | Fetched **404**. Kept as the supplied link; use the City Zoning page and eCode360 Title 9 instead. |
| Zoning map / districts (WPRDC) | https://data.wprdc.org/dataset/zoning | Fetched 200. Page title “Pittsburgh Zoning Districts.” GIS download, not used in HomeSignal metrics. |
| Catalog-supplied map URL (event packet) | https://data.wprdc.org/dataset/pittsburgh-zoning | Fetched **404**. The working WPRDC districts page above is the replacement. |
| City GIS interactive maps directory (includes Pittsburgh Zoning) | https://www.pittsburghpa.gov/Business-Development/Geographic-Information-Systems-Mapping-Open-Data/Geographic-Information-System-GIS-Mapping/Interactive-Apps-Maps-Dashboards | Fetched 200. Directory of maps; not ingested. |

## Optional ACS rent

Not included. The master specification allows one citywide ACS 2020–2024 median gross rent card only after the core works and the value is verified. It was not added in this build.

## Event materials

Participant packet and Track 2 brief were used as event requirements. They are not data sources for dashboard numbers.

## Housing context and reconciliation

The Queue's expandable **Housing context: rents & community** panel includes real public aggregate data, frozen September 27, 2026:

- **Zillow Research ZORI:** Pittsburgh, PA metro (RegionID 394982), all homes plus multifamily, smoothed monthly 2025. [Source and methodology](https://www.zillow.com/research/data/); [downloaded CSV](https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv). Values retain source precision in `data/public/housing-context.json`; the UI rounds dollars. The raw CSV SHA-256 is in that manifest. Historical values may be revised; this is the retrieval-date vintage, not a contemporaneous 2025 release. Attribution: Zillow Research. Zillow data are not covered by the PLI dataset's CC-BY license.
- **U.S. Census Bureau QuickFacts:** [Pittsburgh city, Pennsylvania](https://www.census.gov/quickfacts/pittsburghcitypennsylvania), FIPS 4261000, 2020–2024. Median gross rent $1,261; living in the same house one year ago, 79.4% of people age 1+. Values transcribed from the official table. The API returned a missing-key page, so no API result is claimed. QuickFacts does not display margins of error in this extract. No significance testing or neighborhood allocation is supported.

**Reconciliation:** PLI measures city permit records by 2025 issue month; ZORI measures metro market rents by month; Census measures city survey characteristics over five years. They are displayed together but never joined at household or neighborhood level. The app does not subtract the two rent measures, infer causation, or treat residential stability as displacement or net household flows. Neighborhood queue filters intentionally do not alter this fixed city/metro context. Context does not enter permit CSV or briefing calculations.
