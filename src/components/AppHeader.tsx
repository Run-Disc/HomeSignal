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
  const items = [
    { id: "overview" as const, href: "/", label: "Queue" },
    { id: "review" as const, href: reviewHref, label: "Record" },
    { id: "export" as const, href: exportHref, label: "Briefing" },
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
      </div>
      <nav className="app-nav" aria-label="App">
        {items.map((item) => {
          const current = props.current === item.id;
          return (
            <Link
              key={item.id}
              className={current ? "app-nav-link current" : "app-nav-link"}
              href={item.href}
              aria-current={current ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-meta">
        <Link className="quiet-link" href="/sources">
          {props.snapshotDate}
        </Link>
        <Link className="quiet-link" href="/limitations">
          Docs
        </Link>
      </div>
    </header>
  );
}
