import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Connect | Connect, Share, Excel",
  description: "The ultimate platform for student mentorship and resource sharing.",
};

import { Navbar } from "@/components/layout/Navbar";
import { CommandMenu } from "@/components/layout/CommandMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased min-h-screen relative"
        )}
      >
        <div className="bg-blobs" />
        <Navbar />
        <CommandMenu />
        <main className="relative z-10 w-full h-full pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
