import Link from "next/link";

export function AppHeader(props: {
  snapshotDate: string;
  modeLabel: string;
  exportHref?: string;
  isHome?: boolean;
}) {
  const TitleTag = props.isHome ? "h1" : "p";
  return (
    <header className="topbar">
      <div className="brand">
        <p>Pittsburgh pilot · Track 2 evidence observatory</p>
        <TitleTag className="brand-title">
          {props.isHome ? (
            "HomeSignal"
          ) : (
            <Link href="/" className="brand-link">
              HomeSignal
            </Link>
          )}
        </TitleTag>
        <p>Housing permit evidence, ready for review.</p>
      </div>
      <div className="top-actions">
        <span className="meta-pill">Snapshot {props.snapshotDate}</span>
        <span className="mode-pill">{props.modeLabel}</span>
        <nav className="primary-nav" aria-label="Primary">
          <Link className="btn-secondary" href="/" aria-current={props.isHome ? "page" : undefined}>
            Overview
          </Link>
          <Link className="btn-secondary" href="/sources">
            Sources
          </Link>
          <Link className="btn-secondary" href="/limitations">
            Limitations
          </Link>
          <Link className="btn" href={props.exportHref ?? "/export"}>
            Export briefing
          </Link>
        </nav>
      </div>
    </header>
  );
}
