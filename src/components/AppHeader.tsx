import Link from "next/link";
import { FLAGSHIP_RECORD_ID } from "@/lib/constants";

export type NavSection = "overview" | "review" | "export" | "sources" | "limitations" | "evaluation";

export function AppHeader(props: {
  snapshotDate: string;
  modeLabel: string;
  exportHref?: string;
  queueHref?: string;
  reviewHref?: string;
  current?: NavSection;
  isHome?: boolean;
}) {
  const TitleTag = props.isHome ? "h1" : "p";
  const reviewHref = props.reviewHref ?? `/review/${encodeURIComponent(FLAGSHIP_RECORD_ID)}`;
  const exportHref = props.exportHref ?? "/export";
  const items = [
    { id: "overview" as const, href: props.queueHref ?? "/", label: "Queue" },
    { id: "review" as const, href: reviewHref, label: "Record" },
    { id: "export" as const, href: exportHref, label: "Briefing" },
  ];

  return (
    <header className="topbar">
      <div className="brand">
        <TitleTag className="brand-title">
          {props.isHome ? (
            <span className="brand-lockup">
              <span className="brand-mark" aria-hidden="true">H</span>
              <span><span className="brand-name">HomeSignal</span><span className="brand-subtitle">Permit evidence workspace</span></span>
            </span>
          ) : (
            <Link href="/" className="brand-link">
              <span className="brand-lockup">
                <span className="brand-mark" aria-hidden="true">H</span>
                <span><span className="brand-name">HomeSignal</span><span className="brand-subtitle">Permit evidence workspace</span></span>
              </span>
            </Link>
          )}
        </TitleTag>
      </div>
      <nav className="app-nav" aria-label="App">
        {items.map((item, index) => {
          const current = props.current === item.id;
          return (
            <Link
              key={item.id}
              className={current ? "app-nav-link current" : "app-nav-link"}
              href={item.href}
              aria-current={current ? "page" : undefined}
            >
              <span className="nav-index" aria-hidden="true">{index + 1}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-meta">
        <span className="mode-indicator" title={`${props.modeLabel} Simulated runtime provider for the hackathon demonstration.`}>
          <span className="mode-dot" aria-hidden="true" /> Runtime AI · Demo
        </span>
        <Link className="quiet-link" href="/sources" aria-label={`Sources, snapshot retrieved ${props.snapshotDate}`}>
          Sources
        </Link>
        <Link className="quiet-link" href="/limitations">
          Methods & limits
        </Link>
      </div>
    </header>
  );
}
