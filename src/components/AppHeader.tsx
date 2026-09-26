import Link from "next/link";
import { FLAGSHIP_RECORD_ID } from "@/lib/constants";

export type NavSection = "overview" | "review" | "export" | "sources" | "limitations" | "evaluation";

export function AppHeader(props: {
  snapshotDate: string;
  modeLabel: string;
  exportHref?: string;
  reviewHref?: string;
  current?: NavSection;
  isHome?: boolean;
}) {
  const TitleTag = props.isHome ? "h1" : "p";
  const reviewHref = props.reviewHref ?? `/review/${encodeURIComponent(FLAGSHIP_RECORD_ID)}`;
  const exportHref = props.exportHref ?? "/export";
  const steps = [
    { id: "overview" as const, href: "/", n: "1", label: "Overview" },
    { id: "review" as const, href: reviewHref, n: "2", label: "Review" },
    { id: "export" as const, href: exportHref, n: "3", label: "Export" },
  ];

  return (
    <header className="topbar">
      <div className="brand">
        <TitleTag className="brand-title">
          {props.isHome ? (
            "HomeSignal"
          ) : (
            <Link href="/" className="brand-link">
              HomeSignal
            </Link>
          )}
        </TitleTag>
        <p className="brand-tag">Pittsburgh PLI permit evidence · records, not homes built</p>
      </div>
      <div className="header-meta">
        <span className="meta-pill">Snapshot {props.snapshotDate}</span>
        <span className="mode-pill">{props.modeLabel}</span>
      </div>
      <nav className="step-nav" aria-label="Demo path">
        {steps.map((step) => {
          const current = props.current === step.id;
          return (
            <Link
              key={step.id}
              className={current ? "step-link current" : "step-link"}
              href={step.href}
              aria-current={current ? "page" : undefined}
            >
              <span className="step-num">{step.n}</span>
              {step.label}
            </Link>
          );
        })}
      </nav>
      <nav className="doc-links" aria-label="Background">
        <Link href="/sources" aria-current={props.current === "sources" ? "page" : undefined}>
          Sources
        </Link>
        <Link href="/limitations" aria-current={props.current === "limitations" ? "page" : undefined}>
          Limitations
        </Link>
        <Link href="/evaluation" aria-current={props.current === "evaluation" ? "page" : undefined}>
          Evaluation
        </Link>
      </nav>
    </header>
  );
}
