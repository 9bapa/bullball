import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BullBall",
  description: "Auto buy backs, auto compounding + gifts",
  keywords: ["BullBall", "solana", "meme token", "crypto", "bullrun", "pumpfun", "bitcoin"],
  authors: [{ name: "BullBall Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BullBall",
    description: "Auto buy backs, auto compounding + gifts",
    url: "https://bullball.xyz",
    siteName: "BullBall",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BullBall",
    description: "Auto buy backs, auto compounding + gifts",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
