import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeSignal",
  description: "Permit review workspace for Pittsburgh PLI building records.",
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
