import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HK IT 人加拿大社群",
    template: "%s | HK IT 人加拿大社群",
  },
  description:
    "加拿大香港 IT 人社群 — 職位 Referral 板 & 真實面試題庫，助你在加拿大搵工。",
  metadataBase: new URL("https://hkit-referral.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "HK IT 人加拿大社群",
    title: "HK IT 人加拿大社群 — Referral Board & Interview DB",
    description:
      "加拿大香港 IT 人社群 — 職位 Referral 板 & 真實面試題庫，助你在加拿大搵工。",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "HK IT 人加拿大社群 — Referral Board & Interview DB",
    description:
      "加拿大香港 IT 人社群 — 職位 Referral 板 & 真實面試題庫，助你在加拿大搵工。",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}
