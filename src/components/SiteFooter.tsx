import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-foot">
      <div>
        <strong>HomeSignal</strong>
        <span>Decision support from privacy-reduced public permit descriptions.</span>
      </div>
      <nav aria-label="Documentation">
        <Link href="/sources">Sources</Link>
        <Link href="/limitations">Limitations</Link>
        <Link href="/evaluation">Evaluation</Link>
        <a href="https://github.com/Run-Disc/HomeSignal">Public repository</a>
      </nav>
    </footer>
  );
}
