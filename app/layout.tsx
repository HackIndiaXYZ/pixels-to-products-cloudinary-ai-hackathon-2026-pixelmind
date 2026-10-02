import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelMind",
  description: "One Product. Every Format.",
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