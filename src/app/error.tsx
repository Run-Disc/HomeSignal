"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell">
      <main id="main" className="prose">
        <h1>HomeSignal hit a display error</h1>
        <p>Reload this screen or return to the queue. Source data in the snapshot was not changed.</p>
        <p>
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>{" "}
          <Link className="btn-secondary" href="/">
            Queue
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
