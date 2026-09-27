import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeSignal",
  description:
    "Pittsburgh permit-evidence workspace: review issued PLI descriptions, run a labeled runtime-AI demo, and export cited briefings. Not homes built.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
