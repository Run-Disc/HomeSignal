# Sources

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

The WPRDC resource HTML page displayed a Data Use Agreement. It was not accepted by the implementation agent. CKAN JSON API and dump retrieval used for this snapshot did not present an interactive accept step. If a browser terms gate appears for you, review it yourself before using that path.

## Official City context (not ingested as metrics)

- Permit classifications: https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/Permitting
- OneStopPGH permit center (human follow-up): https://www.pittsburghpa.gov/Business-Development/Permits-Licenses-and-Inspections/OneStopPGH-Permit-Center

## Related Pittsburgh tools (not this product)

HomeSignal does **not** claim that no comparable tools exist. These are different jobs.

| Resource | What it is | URL |
|---|---|---|
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
