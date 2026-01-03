import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SolanaWalletProvider } from "@/components/solana-wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solana Wallet Connect - Web3 DApp",
  description: "Connect your Solana wallet to interact with blockchain applications. Support for Phantom, Solflare, and more.",
  keywords: ["Solana", "Web3", "Wallet", "Blockchain", "Phantom", "Solflare", "Next.js", "TypeScript"],
  authors: [{ name: "Solana DApp Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Solana Wallet Connect",
    description: "Connect your Solana wallet to interact with blockchain applications",
    url: "https://chat.z.ai",
    siteName: "Solana DApp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana Wallet Connect",
    description: "Connect your Solana wallet to interact with blockchain applications",
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
        <SolanaWalletProvider>
          {children}
          <Toaster />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
