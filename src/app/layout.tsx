import type { Metadata } from "next";
import "./globals.css";
import "./lib/envSetup";

export const metadata: Metadata = {
  title: "Unisole Invest Voice Agents Demo",
  description: "Workshop demo for Indian stock market voice agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
