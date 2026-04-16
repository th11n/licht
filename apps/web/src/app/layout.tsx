import type { Metadata } from "next";
import { Saira, Geist_Mono } from "next/font/google";

import "../index.css";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://licht.app"),

  title: {
    default: "Licht - local API client",
    template: "%s - Licht",
  },

  description:
    "Fast, local-first API client. Send requests, debug endpoints, and test your APIs directly from your machine.",

  keywords: [
    "api client",
    "postman alternative",
    "api testing tool",
    "http client",
    "rest client",
    "api debugging tool",
    "test api locally",
    "local api testing",
    "developer tools",
    "backend debugging",
    "inspect http requests",
    "api request tool",
  ],

  openGraph: {
    title: "Licht - local API client",
    description:
      "A fast, local-first alternative to Postman. Debug and test APIs without the cloud.",
    url: "https://licht.app",
    siteName: "Licht",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Licht - local API client",
    description:
      "A fast, local-first alternative to Postman.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${saira.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            {/* <Navbar /> */}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
