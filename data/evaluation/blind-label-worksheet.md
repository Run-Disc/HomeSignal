# Blind label worksheet (human only)

Use this sheet before looking at any model output. Do not copy model predictions into labels. Held-out IDs are listed at the bottom and should stay unlabeled during prompt work.

Semantic accuracy is **unmeasured** until a human or housing SME completes these rows independently. Cursor assembled the excerpts from the sanitized 2025 snapshot and did not fill answers.

Mark: housing relevance (`housing` / `not_housing` / `uncertain`); scope (`new_building` / `conversion` / `addition_or_alteration` / `demolition` / `other` / `uncertain`); count role (existing / proposed total / added / removed / unknown); and a short note. Prefer unknown over inventing a number.

| ID | Group | Class | Excerpt (sanitized) | Relevance | Scope | Count role | Notes |
|---|---|---|---|---|---|---|---|
| BDA-2024-05307 | commercial_explicit_units | Commercial | TOTAL OF 12 DWELLING UNITS ABOVE (new four-story building, future commercial first floor) | | | | |
| BP-2024-07845 | commercial_explicit_units | Commercial | OCCUPANCY CHANGE TO CREATE 7 DWELLING UNITS | | | | |
| BDA-2024-03621 | commercial_conversion | Commercial | CONVERT 2 UNIT BUILDING TO 3 UNIT BUILDING | | | | |
| BDA-2025-01572 | ambiguous_no_work | Commercial | NO WORK - … CONTINUED USE OF TWO STORY BUILDING FOR 32 UNIT DWELLINGS | | | | |
| BDA-2025-02945 | existing_multifamily_alteration | Commercial | INTERIOR RENNOVATION OF 14 UNIT 3 STORY APARTMENT BUILDING | | | | |
| BP-2024-13991 | new_apartment_building | Commercial | CONSTRUCTION OF 3 STORY APARTMENT BUILDING … WITH 9 APARTMENTS | | | | |
| BDA-2024-07188 | conversion_one_unit | Commercial | CONVERT THE EXISTING 1ST FLOOR INTO A RESIDENTIAL DWELLING UNIT | | | | |
| BDA-2024-01477 | comparison_office | Commercial | RECONFIGURATION OF OFFICE SPACE … EXISTING 2 STORY BUILDING | | | | |
| BDA-2024-00977 | comparison_sign | Commercial | (2) ILLUMINATED CHANNEL LETTER WALL SIGNS | | | | |
| BDA-2024-00147 | comparison_porch | Residential | REPAIR FRONT PORCH | | | | |
| BDA-2024-00877 | childcare_occupancy | Residential | OCCUPANCY ONLY APPLICATION FOR A HOME-BASED GROUP CHILDCARE PROGRAM | | | | |
| BDA-2024-01223 | blank_description | Residential | *(blank description)* | | | | |

Held-out (do not use while iterating on the extraction prompt): `BP-2023-13277`, `BDA-2024-02517`, `BDA-2024-08094`, `BP-2023-15093`, `BDA-2024-07470`.
