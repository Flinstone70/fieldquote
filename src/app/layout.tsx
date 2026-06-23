import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "FieldQuote — Premium quotes & deposits for trades",
    template: "%s · FieldQuote",
  },
  description:
    "UK quoting platform for trades and field service companies. Sign up, verify your email, and send professional quotes with secure deposit collection.",
  keywords: [
    "quotes",
    "trades",
    "deposits",
    "field service",
    "plumber",
    "electrician",
    "SaaS",
  ],
  openGraph: {
    title: "FieldQuote — Premium quotes & deposits for trades",
    description:
      "Quote like a premium firm. Get paid before you start.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "FieldQuote",
    description: "Premium quoting and deposit collection for trades.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-950 antialiased">
        {children}
      </body>
    </html>
  );
}
