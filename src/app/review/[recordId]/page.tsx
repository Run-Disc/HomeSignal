import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ReviewWorkspace } from "@/components/ReviewWorkspace";
import { SiteFooter } from "@/components/SiteFooter";
import { currentAiMode, modeDescription } from "@/lib/extractClient";
import { loadPermits, sourceManifest, toClientPermit } from "@/lib/loadSnapshot";
import { filtersFromSearchParams, filtersToSearchParams, pageSearchParams } from "@/lib/filters";
import { applyFilters } from "@/lib/metrics";

export async function generateMetadata({ params }: { params: Promise<{ recordId: string }> }): Promise<Metadata> {
  const { recordId } = await params;
  const record = loadPermits().find((p) => p.recordId === decodeURIComponent(recordId));
  return { title: record ? `${record.sourcePermitId} · Record review · HomeSignal` : "Record not found · HomeSignal" };
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ recordId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = filtersFromSearchParams(pageSearchParams(await searchParams));
  const contextQuery = filtersToSearchParams(filters);
  const { recordId } = await params;
  const decoded = decodeURIComponent(recordId);
  const briefingQuery = filtersToSearchParams({ ...filters, reviewState: "all" }, decoded);
  const permits = loadPermits();
  const idx = permits.findIndex((p) => p.recordId === decoded);
  if (idx < 0) notFound();
  const record = toClientPermit(permits[idx]);
  const candidates = applyFilters(permits, { ...filters, reviewState: "all" }, {});
  const cidx = candidates.findIndex((p) => p.recordId === decoded);
  const prev = cidx > 0 ? candidates[cidx - 1].recordId : null;
  const next =
    cidx >= 0 && cidx < candidates.length - 1
      ? candidates[cidx + 1].recordId
      : null;
  const mode = currentAiMode();
  const manifest = sourceManifest();

  return (
    <div className="shell">
      <AppHeader
        snapshotDate={manifest.retrievalDate}
        modeLabel={`AI mode: ${mode}`}
        current="review"
        queueHref={`/?${contextQuery}`}
        reviewHref={`/review/${encodeURIComponent(record.recordId)}?${contextQuery}`}
        exportHref={`/export?${briefingQuery}`}
      />
      <main id="main">
        <h1 className="sr-only">Review permit record {record.sourcePermitId}</h1>
        <ReviewWorkspace
          record={record}
          neighbors={{ prev, next }}
          modeDescription={modeDescription(mode)}
          aiMode={mode}
          contextQuery={contextQuery}
          briefingQuery={briefingQuery}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
