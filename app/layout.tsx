import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local SEO & AEO Pro",
  description: "Premium local search and answer-engine optimization — maps, entities, and AI-ready visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
