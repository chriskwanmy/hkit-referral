import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Google Analytics 4 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-TK0KW8Y24Y"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TK0KW8Y24Y');
          `,
        }}
      />
      {/*
        Viewport must NOT disable user-scalable — required by WCAG 1.4.4
        Next.js sets a safe default; we leave it as-is.
      */}
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Skip-to-main: the first interactive element on every page */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Nav />
        {children}
      </body>
    </html>
  );
}
