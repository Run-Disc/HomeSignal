#!/usr/bin/env python3
"""Ingest Pittsburgh PLI permits into a sanitized HomeSignal snapshot.

This script is development-time only. It reads a local CKAN dump, never
invents rows, and writes provenance plus a privacy-filtered working corpus.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_CSV = ROOT / "tmp" / "pli_raw.csv"
OUT_DIR = ROOT / "data"
PUBLIC_DIR = ROOT / "public" / "data"

# Official labels from the current resource notes and observed rows.
BUILDING_TYPES = {
    "BUILDING",
    "Building & Development Application",
}

CANDIDATE_KEYWORDS = [
    "DWELLING",
    "RESIDENTIAL",
    "APARTMENT",
    "APARTMENTS",
    "MULTI-FAMILY",
    "MULTIFAMILY",
    "MULTI FAMILY",
    "MIXED USE",
    "MIXED-USE",
    "CONDO",
    "CONDOMINIUM",
    "TOWNHOUSE",
    "TOWNHOME",
    "HOUSING",
    "UNITS",
    "UNIT ",
    " UNIT",
    "BEDROOM",
    "SINGLE-FAMILY",
    "SINGLE FAMILY",
    "TWO-FAMILY",
    "TWO FAMILY",
    "THREE-FAMILY",
    "FOUR-FAMILY",
    "DUPLEX",
    "TRIPLEX",
    "CONVERSION",
    "CHANGE OF USE",
    "CHANGE-OF-USE",
    "NEW CONSTRUCTION",
    "NEW BUILDING",
    "NEW 3-STORY",
    "NEW 2-STORY",
    "NEW TWO",
    "NEW THREE",
    "ACCESSORY DWELLING",
    "ADU",
    "LIVE/WORK",
    "LIVE-WORK",
    "ROOMING",
    "BOARDING",
]

# Conservative contact-pattern redaction. Not claimed to be complete.
EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PHONE_RE = re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b")
SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
NAMED_CONTACT_RE = re.compile(
    r"\b(CONTACT|CALL|PHONE|EMAIL|OWNER|CONTRACTOR|APPLICANT|ATTN|HOMEOWNER)\s*[:\-]\s*[A-Z0-9 .,'@+-]{2,40}",
    re.I,
)
STREET_SUFFIX = (
    r"(?:STREET|AVENUE|BOULEVARD|ROAD|DRIVE|LANE|COURT|PLACE|TERRACE|PARKWAY|"
    r"CIRCLE|HIGHWAY|ST|AVE|BLVD|RD|DR|LN|CT|PL|TER|PKWY|CIR|HWY)\.?"
)
HOUSE_ADDRESS_RE = re.compile(
    rf"\b\d{{1,6}}[A-Z]?\s+(?:[NSEW]\.?\s+)?[A-Z0-9][A-Z0-9.'-]{{0,30}}(?:\s+[A-Z0-9.'-]{{1,20}}){{0,3}}\s+{STREET_SUFFIX}\b",
    re.I,
)

UNIT_HINT_RE = re.compile(
    r"\b(\d+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE)\s+"
    r"(UNIT|UNITS|DWELLING UNITS|APARTMENT|APARTMENTS|FAMILY DWELLING|FAMILY DWELLINGS|"
    r"FAMILY HOUSE|FAMILY HOUSES|FAMILY RESIDENCE)\b",
    re.I,
)


def _safe_replace(text: str, needle: str, token: str) -> str:
    if not needle or len(needle.strip()) < 3:
        return text
    return re.sub(re.escape(needle.strip()), token, text, flags=re.I)


def privacy_scan(rec: dict) -> tuple[str | None, list[str], str | None]:
    """Return (sanitized_text, flags, exclude_reason). Never returns invented source prose.

    Structured owner/contractor/address values are used only to detect and remove
    matches; they are not written to the public snapshot or the audit payload.
    """
    original = rec.get("work_description") or ""
    flags: list[str] = []
    if not str(original).strip():
        return "", flags, None

    out = original
    if EMAIL_RE.search(out):
        out = EMAIL_RE.sub("[REDACTED_EMAIL]", out)
        flags.append("redacted_email")
    if PHONE_RE.search(out):
        out = PHONE_RE.sub("[REDACTED_PHONE]", out)
        flags.append("redacted_phone")
    if SSN_RE.search(out):
        out = SSN_RE.sub("[REDACTED_ID]", out)
        flags.append("redacted_id_pattern")
    if NAMED_CONTACT_RE.search(out):
        out = NAMED_CONTACT_RE.sub("[REDACTED_CONTACT]", out)
        flags.append("redacted_contact_phrase")
    if HOUSE_ADDRESS_RE.search(out):
        out = HOUSE_ADDRESS_RE.sub("[REDACTED_ADDRESS]", out)
        flags.append("redacted_street_address")

    owner = rec.get("owner_name") or ""
    contractor = rec.get("contractor_name") or ""
    address = rec.get("address") or ""
    if owner and owner.strip().upper() in out.upper():
        out = _safe_replace(out, owner, "[REDACTED_NAME]")
        flags.append("redacted_owner_in_description")
    if contractor and contractor.strip().upper() in out.upper():
        out = _safe_replace(out, contractor, "[REDACTED_NAME]")
        flags.append("redacted_contractor_in_description")
    if address:
        addr_core = address.split(",")[0].strip()
        if len(addr_core) >= 8 and addr_core.upper() in out.upper():
            out = _safe_replace(out, addr_core, "[REDACTED_ADDRESS]")
            flags.append("redacted_source_address_in_description")

    residual: list[str] = []
    if EMAIL_RE.search(out):
        residual.append("email")
    if PHONE_RE.search(out):
        residual.append("phone")
    if NAMED_CONTACT_RE.search(out):
        residual.append("contact_phrase")
    if HOUSE_ADDRESS_RE.search(out):
        residual.append("street_address")
    if owner and len(owner.strip()) >= 4 and owner.strip().upper() in out.upper():
        residual.append("owner_name")
    if contractor and len(contractor.strip()) >= 4 and contractor.strip().upper() in out.upper():
        residual.append("contractor_name")
    if address:
        addr_core = address.split(",")[0].strip()
        if len(addr_core) >= 8 and addr_core.upper() in out.upper():
            residual.append("source_address")
    if residual:
        return None, flags, ",".join(residual)
    return out, flags, None


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def normalize_neighborhood(value: str | None) -> str:
    if value is None:
        return "Unknown"
    trimmed = " ".join(str(value).split())
    return trimmed if trimmed else "Unknown"


def parse_issue_date(value: str | None) -> str | None:
    if not value:
        return None
    s = str(value).strip()
    if not s:
        return None
    # Keep date-only YYYY-MM-DD; do not timezone-shift.
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}T.*", s):
        return s[:10]
    return None


def is_building_type(permit_type: str | None) -> bool:
    if not permit_type:
        return False
    return permit_type in BUILDING_TYPES or permit_type.upper() == "BUILDING"


def has_candidate_keyword(desc: str) -> bool:
    u = desc.upper()
    return any(k in u for k in CANDIDATE_KEYWORDS)


def main() -> int:
    if not RAW_CSV.exists():
        print(f"Missing raw dump: {RAW_CSV}", file=sys.stderr)
        return 1

    retrieved_at = iso_now()
    raw_hash = sha256_file(RAW_CSV)
    raw_bytes = RAW_CSV.stat().st_size

    downloaded_rows = 0
    rejected_malformed = 0
    building_2025: list[dict] = []
    type_counts: Counter[str] = Counter()
    class_counts: Counter[str] = Counter()
    status_counts: Counter[str] = Counter()
    work_type_counts: Counter[str] = Counter()
    year_counts: Counter[str] = Counter()
    month_counts: Counter[str] = Counter()
    missing = Counter()
    permit_id_counts: Counter[str] = Counter()
    conflicting_ids: dict[str, list[dict]] = defaultdict(list)
    seen_by_id: dict[str, dict] = {}
    exact_dupes = 0
    unit_hint_records: list[str] = []
    descriptions_blank = 0
    commercial_housing_keyword = 0
    neighborhood_counts: Counter[str] = Counter()

    with RAW_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        for row in reader:
            downloaded_rows += 1
            pid = (row.get("permit_id") or "").strip()
            if not pid:
                missing["permit_id"] += 1
            ptype = (row.get("permit_type") or "").strip()
            type_counts[ptype or "(blank)"] += 1
            issue = parse_issue_date(row.get("issue_date"))
            if not issue:
                missing["issue_date"] += 1
                year = "unknown"
            else:
                year = issue[:4]
            year_counts[year] += 1

            if not is_building_type(ptype) or year != "2025":
                continue

            rec = {k: (row.get(k) if row.get(k) not in ("", None) else None) for k in fieldnames}
            rec["issue_date_parsed"] = issue
            rec_key = json.dumps(rec, sort_keys=True, default=str)
            if pid in seen_by_id:
                prev = seen_by_id[pid]
                prev_key = json.dumps(prev, sort_keys=True, default=str)
                if rec_key == prev_key:
                    exact_dupes += 1
                    continue
                conflicting_ids[pid].append(rec)
                continue
            seen_by_id[pid] = rec
            permit_id_counts[pid] += 1
            building_2025.append(rec)

    # Quality on retained 2025 building/BDA unique-id records
    for rec in building_2025:
        src_class = rec.get("commercial_or_residential") or "(blank)"
        class_counts[src_class] += 1
        status_counts[rec.get("status") or "(blank)"] += 1
        work_type_counts[rec.get("work_type") or "(blank)"] += 1
        if not rec.get("neighborhood"):
            missing["neighborhood"] += 1
        neighborhood_counts[normalize_neighborhood(rec.get("neighborhood"))] += 1
        desc = rec.get("work_description") or ""
        if not str(desc).strip():
            descriptions_blank += 1
            missing["work_description"] += 1
        month = rec["issue_date_parsed"][:7]
        month_counts[month] += 1
        if has_candidate_keyword(desc) and (rec.get("commercial_or_residential") or "").lower() == "commercial":
            commercial_housing_keyword += 1
        if UNIT_HINT_RE.search(desc or ""):
            unit_hint_records.append(rec["permit_id"])

    # Candidate selection: keyword match OR work_type suggesting new/conversion,
    # across ALL source classes. Also retain a comparison sample of non-keyword records.
    candidates: list[dict] = []
    non_candidates: list[dict] = []
    for rec in building_2025:
        desc = rec.get("work_description") or ""
        wt = (rec.get("work_type") or "").upper()
        keyword = has_candidate_keyword(desc)
        structured = any(x in wt for x in ["NEW", "CONVERSION", "CHANGE OF USE", "DEMOLITION"])
        if keyword or structured:
            candidates.append(rec)
        else:
            non_candidates.append(rec)

    # Target 50-150 AI/review corpus from candidates, plus comparison sample.
    # Prefer diversity: commercial-class, unit-hint, and remaining keyword records.
    def rank(rec: dict) -> tuple:
        desc = rec.get("work_description") or ""
        commercial = 0 if (rec.get("commercial_or_residential") or "").lower() == "commercial" else 1
        unit = 0 if rec["permit_id"] in unit_hint_records else 1
        length = -len(desc)
        return (commercial, unit, length)

    ranked = sorted(candidates, key=rank)
    # Keep all candidates in the dashboard snapshot; AI allowlist is a smaller subset.
    review_corpus = ranked[:120]
    comparison_sample = non_candidates[:20]

    snapshot_records = []
    redaction_audit = Counter()
    excluded_privacy = Counter()
    excluded_privacy_count = 0
    candidate_ids = {r["permit_id"] for r in candidates}
    comparison_ids = {r["permit_id"] for r in comparison_sample}
    review_ids = {r["permit_id"] for r in review_corpus}

    retained_ids_building = []
    for rec in building_2025:
        sanitized, flags, exclude_reason = privacy_scan(rec)
        if exclude_reason:
            excluded_privacy_count += 1
            excluded_privacy[exclude_reason] += 1
            continue
        assert sanitized is not None
        for fl in flags:
            redaction_audit[fl] += 1
        pid = rec["permit_id"]
        retained_ids_building.append(pid)
        neighborhood = normalize_neighborhood(rec.get("neighborhood"))
        desc = rec.get("work_description") or ""
        snapshot_records.append(
            {
                "recordId": f"pli:{pid}",
                "sourcePermitId": pid,
                "sourceResourceId": "f4d1177a-f597-4c32-8cbf-7885f56253f6",
                "issueDate": rec["issue_date_parsed"],
                "permitTypeRaw": rec.get("permit_type"),
                "permitTypeNormalized": (
                    "building_development_application"
                    if rec.get("permit_type") == "Building & Development Application"
                    else "building"
                    if (rec.get("permit_type") or "").upper() == "BUILDING"
                    else "other"
                ),
                "sourceClassRaw": rec.get("commercial_or_residential"),
                "workTypeRaw": rec.get("work_type"),
                "sourceStatusRaw": rec.get("status"),
                "neighborhood": neighborhood,
                "workDescriptionSanitized": sanitized,
                "citationId": f"src:pli:{pid}",
                "snapshotVersion": "pli-2025-bda-v1",
                "qualityFlags": flags
                + (["blank_description"] if not str(desc).strip() else [])
                + (["unknown_neighborhood"] if neighborhood == "Unknown" else []),
                "candidateDiscovery": {
                    "selected": pid in candidate_ids,
                    "method": "keyword_or_structured_work_type",
                },
                "inReviewCorpus": pid in review_ids,
                "inComparisonSample": pid in comparison_ids,
            }
        )

    # Recompute candidate/review flags from retained records only.
    retained_ids = {r["sourcePermitId"] for r in snapshot_records}
    for rec in snapshot_records:
        rec["inReviewCorpus"] = rec["inReviewCorpus"] and rec["sourcePermitId"] in retained_ids
        rec["inComparisonSample"] = rec["inComparisonSample"] and rec["sourcePermitId"] in retained_ids
        rec["candidateDiscovery"]["selected"] = rec["candidateDiscovery"]["selected"] and rec["sourcePermitId"] in retained_ids

    # If privacy exclusion dropped review-corpus members, refill from remaining candidates.
    remaining_candidates = [
        r for r in snapshot_records if r["candidateDiscovery"]["selected"]
    ]
    remaining_candidates.sort(
        key=lambda r: (
            0 if (r.get("sourceClassRaw") or "").lower() == "commercial" else 1,
            0 if r["sourcePermitId"] in unit_hint_records else 1,
            -len(r["workDescriptionSanitized"] or ""),
        )
    )
    review_ids = {r["sourcePermitId"] for r in remaining_candidates[:120]}
    remaining_non = [r for r in snapshot_records if not r["candidateDiscovery"]["selected"]]
    comparison_ids = {r["sourcePermitId"] for r in remaining_non[:20]}
    for rec in snapshot_records:
        rec["inReviewCorpus"] = rec["sourcePermitId"] in review_ids
        rec["inComparisonSample"] = rec["sourcePermitId"] in comparison_ids

    snapshot_records.sort(key=lambda r: (r["issueDate"], r["sourcePermitId"]))
    payload = json.dumps(snapshot_records, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    snapshot_hash = sha256_bytes(payload)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    snapshot_path = PUBLIC_DIR / "permits-2025.json"
    snapshot_path.write_bytes(payload)
    (OUT_DIR / "public").mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "public" / "permits-2025.json").write_bytes(payload)

    manifest = {
        "sourceId": "wprdc-pli-permits",
        "title": "PLI Permits",
        "publisher": "City of Pittsburgh (hosted by Western Pennsylvania Regional Data Center)",
        "landingUrl": "https://data.wprdc.org/dataset/pli-permits",
        "resourceId": "f4d1177a-f597-4c32-8cbf-7885f56253f6",
        "downloadUrl": "https://data.wprdc.org/datastore/dump/f4d1177a-f597-4c32-8cbf-7885f56253f6",
        "retrievalDate": retrieved_at,
        "sourceUpdateDate": "2026-09-26T03:22:05.014160",
        "coveredDates": "Issue dates 2025-01-01 through 2025-12-31 in this snapshot; source series documentation starts 2019-06-01.",
        "geography": "City of Pittsburgh neighborhoods as provided by the source neighborhood field",
        "license": "Creative Commons Attribution (cc-by)",
        "licenseUrl": "http://www.opendefinition.org/licenses/cc-by",
        "attribution": "Contains data from the Western Pennsylvania Regional Data Center and the City of Pittsburgh Permits, Licenses, and Inspections Department. HomeSignal transformed the 2025 Building / Building & Development Application cohort as documented in SOURCES.md.",
        "fieldsUsed": [
            "permit_id",
            "permit_type",
            "work_description",
            "work_type",
            "commercial_or_residential",
            "issue_date",
            "neighborhood",
            "status",
        ],
        "excludedFields": [
            "owner_name",
            "contractor_name",
            "address",
            "parcel_num",
            "latitude",
            "longitude",
            "total_project_value",
            "council_district",
            "ward",
            "zip_code",
        ],
        "transformations": [
            "Kept issue-date year 2025 and permit_type BUILDING or Building & Development Application.",
            "Trimmed neighborhood whitespace; empty neighborhood labeled Unknown.",
            "Stored issue_date as date-only YYYY-MM-DD.",
            "Scanned descriptions for emails, phones, SSN-like ids, contact phrases, house-number street addresses, and owner/contractor/source-address strings; redacted matches with tokens or excluded the record if residual personal data remained.",
            "Did not retain owner, contractor, street address, parcel number, coordinates, or project value.",
            "Candidate flag uses documented keywords or NEW/CONVERSION/CHANGE OF USE/DEMOLITION in work_type.",
        ],
        "obtainedRowCount": downloaded_rows,
        "acceptedRowCount": len(snapshot_records),
        "candidateCount": sum(1 for r in snapshot_records if r["candidateDiscovery"]["selected"]),
        "privacyExcludedCount": excluded_privacy_count,
        "missingness": {
            "blankDescriptionsInCohort": sum(1 for r in snapshot_records if "blank_description" in r["qualityFlags"]),
            "missingNeighborhoodInCohort": missing["neighborhood"],
            "resourcePagePreviewRowsDisagreeWithDatastoreTotal": "49255 preview vs 65378 datastore/download rows",
        },
        "duplicateHandling": "No exact duplicate rows and no conflicting permit_id values observed in the 2025 Building/BDA cohort.",
        "checksum": snapshot_hash,
        "snapshotVersion": "pli-2025-bda-v1",
        "knownLimitations": [
            "An issued permit is not evidence that work started, finished, or became occupied.",
            "Source status is a current label, not a complete historical timeline.",
            "Candidate selection is a discovery aid, not a complete housing-permit inventory.",
            "No project-level deduplication; multiple records may describe one building.",
            "Automated redaction is incomplete.",
            "Blank work descriptions remain blank; they are missing text, not zero units.",
            "Parcel numbers are not retained in the public snapshot.",
        ],
    }
    (PUBLIC_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    saved_path = PUBLIC_DIR / "saved-extractions.json"
    if not saved_path.exists():
        saved_path.write_text("[]\n", encoding="utf-8")

    # Distinct values for filters
    neighborhoods = sorted({r["neighborhood"] for r in snapshot_records})
    permit_types = sorted({r["permitTypeRaw"] or "" for r in snapshot_records})
    source_classes = sorted({r["sourceClassRaw"] or "" for r in snapshot_records})

    discovery_report = {
        "retrievedAt": retrieved_at,
        "rawFile": str(RAW_CSV.relative_to(ROOT)),
        "rawBytes": raw_bytes,
        "rawSha256": raw_hash,
        "csvFieldnames": fieldnames,
        "downloadedRows": downloaded_rows,
        "datastoreReportedTotal": 65378,
        "resourcePagePreviewRows": 49255,
        "rowCountNote": "csv.DictReader row count is the downloaded count; multiline descriptions can make wc -l larger.",
        "permitTypeCountsAllYears": type_counts.most_common(),
        "yearCountsAllTypes": year_counts.most_common(),
        "cohort": {
            "definition": "issue_date year 2025 AND permit_type in {BUILDING, Building & Development Application}",
            "acceptedUniqueIds": len(snapshot_records),
            "exactDuplicateRowsCollapsed": exact_dupes,
            "conflictingSameIdRows": {k: len(v) for k, v in conflicting_ids.items()},
            "classCounts": class_counts.most_common(),
            "statusCounts": status_counts.most_common(),
            "workTypeCounts": work_type_counts.most_common(),
            "monthCounts": sorted(month_counts.items()),
            "neighborhoodCounts": neighborhood_counts.most_common(),
            "blankDescriptions": descriptions_blank,
            "missingNeighborhood": missing["neighborhood"],
            "commercialRecordsWithHousingKeywords": commercial_housing_keyword,
            "unitHintRecordIdsSample": unit_hint_records[:25],
            "unitHintRecordCount": len(set(unit_hint_records)),
        },
        "candidateSelection": {
            "method": "case-insensitive keyword list on work_description OR work_type containing NEW/CONVERSION/CHANGE OF USE/DEMOLITION; all source classes retained",
            "candidateCount": len(candidates),
            "nonCandidateCount": len(non_candidates),
            "reviewCorpusTarget": 120,
            "reviewCorpusCount": len(review_corpus),
            "comparisonSampleCount": len(comparison_sample),
            "keywords": CANDIDATE_KEYWORDS,
        },
        "privacy": {
            "excludedStructuredFields": [
                "owner_name",
                "contractor_name",
                "address",
                "parcel_num",
                "latitude",
                "longitude",
                "total_project_value",
            ],
            "redactionFlags": dict(redaction_audit),
            "recordsExcludedForResidualPersonalData": excluded_privacy_count,
            "exclusionReasonCounts": dict(excluded_privacy),
            "note": "Automated redaction is incomplete. Builder must inspect the review corpus before any external model call. Exclusion/redaction audit does not store the removed personal strings.",
        },
        "snapshotSha256": snapshot_hash,
        "snapshotVersion": "pli-2025-bda-v1",
        "permitTypesObservedInCohort": permit_types,
        "sourceClassesObservedInCohort": source_classes,
        "neighborhoodsObservedInCohort": neighborhoods,
    }

    (OUT_DIR / "discovery-report.json").write_text(
        json.dumps(discovery_report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # Human-readable samples of descriptions for builder inspection (sanitized, no address/owner)
    samples = []
    for rec in [r for r in snapshot_records if r["inReviewCorpus"]][:40]:
        samples.append(
            {
                "sourcePermitId": rec["sourcePermitId"],
                "issueDate": rec["issueDate"],
                "neighborhood": rec["neighborhood"],
                "sourceClassRaw": rec.get("sourceClassRaw"),
                "workTypeRaw": rec.get("workTypeRaw"),
                "permitTypeRaw": rec.get("permitTypeRaw"),
                "workDescriptionSanitized": rec["workDescriptionSanitized"],
                "unitHint": rec["sourcePermitId"] in unit_hint_records,
            }
        )
    (OUT_DIR / "review-corpus-preview.json").write_text(
        json.dumps(samples, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(json.dumps({
        "downloadedRows": downloaded_rows,
        "cohort": len(snapshot_records),
        "privacyExcluded": excluded_privacy_count,
        "redactionFlags": dict(redaction_audit),
        "candidates": sum(1 for r in snapshot_records if r["candidateDiscovery"]["selected"]),
        "reviewCorpus": sum(1 for r in snapshot_records if r["inReviewCorpus"]),
        "unitHintRecords": len(set(unit_hint_records)),
        "commercialKeyword": commercial_housing_keyword,
        "conflictingIds": len(conflicting_ids),
        "exactDupes": exact_dupes,
        "months": sorted(month_counts.items()),
        "types": [t for t, _ in type_counts.most_common(15)],
        "snapshot": str(snapshot_path),
        "hash": snapshot_hash,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
