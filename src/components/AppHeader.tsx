import Link from "next/link";

export function AppHeader(props: {
  snapshotDate: string;
  modeLabel: string;
  exportHref?: string;
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <p>Pittsburgh pilot · Track 2 evidence observatory</p>
        <h1>HomeSignal</h1>
        <p>Housing permit evidence, ready for review.</p>
      </div>
      <div className="top-actions">
        <span className="meta-pill">Snapshot {props.snapshotDate}</span>
        <span className="mode-pill">{props.modeLabel}</span>
        <Link className="btn-secondary" href="/sources">
          Sources
        </Link>
        <Link className="btn" href={props.exportHref ?? "/export"}>
          Export briefing
        </Link>
      </div>
    </header>
  );
}
