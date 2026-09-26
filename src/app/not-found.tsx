import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="shell">
      <main id="main" className="prose">
        <h1>Record not found</h1>
        <p>That permit ID is not in the 2025 Building/BDA snapshot.</p>
        <p>
          <Link href="/">Return to overview</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
