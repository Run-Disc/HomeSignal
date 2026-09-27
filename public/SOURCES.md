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

## Zoning context only (not used by HomeSignal)

These pages were supplied in the event catalog. HomeSignal does **not** ingest them, join parcels to districts, interpret the code, or claim zoning feasibility.

| Resource | URL |
|---|---|
| Pittsburgh Zoning Code | https://pittsburghpa.gov/dcp/zoning-code |
| Pittsburgh Zoning Districts (map / GIS) | https://data.wprdc.org/dataset/pittsburgh-zoning |
| WPRDC zoning dataset page | https://data.wprdc.org/dataset/zoning |

The catalog’s older zoning URL was reported stale in pre-event notes; the WPRDC zoning dataset page is listed as the checked alternative. Neither is a data source for Queue metrics.

## Optional ACS rent

Not included. The master specification allows one citywide ACS 2020–2024 median gross rent card only after the core works and the value is verified. It was not added in this build.

## Event materials

Participant packet and Track 2 brief were used as event requirements. They are not data sources for dashboard numbers.
