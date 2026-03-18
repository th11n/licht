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
  title: "licht",
  description: "licht",
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
