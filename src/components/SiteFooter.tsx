import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-foot">
      <Link href="/sources">Sources</Link> · <Link href="/limitations">Limitations</Link> ·{" "}
      <Link href="/evaluation">Evaluation</Link>
    </footer>
  );
}
