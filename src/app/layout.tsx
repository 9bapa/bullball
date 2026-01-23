import type { Metadata } from "next";
import { Orbitron, Outfit, Inter, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SolanaWalletProvider } from "@/components/solana/SolanaWalletProvider";
import { UserProvider } from '@/context/userContext'
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";

// Brand font - Futuristic, geometric
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Header font - Bold, modern, confident
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Body font - Clean, highly readable
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BullRhun - 24/7 Bullrhun",
  description: "The go-to marketplace for crypto & trading merch, swag, and gag gifts. Smart. Playful. Confident.",
  keywords: ["BullRhun", "bullrun", "crypto", "trading", "merch", "swag", "gag gifts", "bitcoin", "ethereum","blockchain", "bnb", "binance", "xrp", "crypto merch", "trading swag", "crypto gifts", "trading merchandise", "crypto apparel"],
  authors: [{ name: "BullRhun Team" }],
  openGraph: {
    title: "BullRhun - 24/7 Bullrhun",
    description: "The go-to marketplace for crypto & trading merch, swag, and gag gifts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BullRhun - 24/7 Bullrhun",
    description: "The go-to marketplace for crypto & trading merch, swag, and gag gifts",
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
        className={`${orbitron.variable} ${outfit.variable} ${inter.variable} font-sans antialiased`}
      >
        <SolanaWalletProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </UserProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
