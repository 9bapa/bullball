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
  title: "BullRhun",
  description: "Bullish flywheel, auto compounding + gifts",
  keywords: ["BullRhun", "solana", "meme token", "crypto", "bullrun", "pumpfun", "bitcoin"],
  authors: [{ name: "BullRhun Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BullRhun",
    description: "Auto buy backs, auto compounding + gifts",
    url: "https://bullrhun.xyz",
    siteName: "BullRhun",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BullRhun",
    description: "Bullish flywheel, auto compounding + gifts",
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
