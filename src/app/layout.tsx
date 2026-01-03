import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ClientDynamicProvider from '@/components/wallet/ClientDynamicProvider'
import { Toaster } from "@/components/ui/sonner"
import HydrationWrapper from '@/components/ui/hydration-wrapper'

const inter = Inter({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--font-inter'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: "BullRhun - Meme Coin Merch Store",
  description: "Rock the latest meme coin merch. From Doge to Pepe, Shiba to Floki - we've got your crypto swag covered!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white font-sans`}>
        <ClientDynamicProvider>
          <HydrationWrapper>
            {children}
            <Toaster />
          </HydrationWrapper>
        </ClientDynamicProvider>
      </body>
    </html>
  );
}