import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-foot">
      Data: City of Pittsburgh PLI Permits via WPRDC, Creative Commons Attribution. Prototype review is
      not a City determination.{" "}
      <Link href="/sources">Sources</Link> · <Link href="/limitations">Limitations</Link> ·{" "}
      <Link href="/evaluation">Evaluation</Link> ·{" "}
      <a href="https://github.com/Run-Disc/HomeSignal">Public repository</a>
    </footer>
  );
}
