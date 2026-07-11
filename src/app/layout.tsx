import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FitTrack AI",
    template: "%s · FitTrack AI",
  },
  description:
    "FitTrack AI is a personal fitness and nutrition tracker with a modern dashboard, macro targets, and AI-ready architecture.",
  applicationName: "FitTrack AI",
  authors: [{ name: "FitTrack AI" }],
  keywords: [
    "fitness",
    "nutrition",
    "calorie tracker",
    "macros",
    "BMR",
    "TDEE",
    "supabase",
    "nextjs",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">{children}</body>
    </html>
  );
}
