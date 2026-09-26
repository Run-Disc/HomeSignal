import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeSignal — Housing permit evidence, ready for review",
  description:
    "Pittsburgh PLI permit evidence observatory. Issued permits are not completed homes.",
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
