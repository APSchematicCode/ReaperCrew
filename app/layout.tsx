import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UnifrakturMaguntia } from 'next/font/google'; // ✅ Added
import "./globals.css";
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import ToastContainer from '@/components/Toast'
import Footer from '@/components/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Configure the Old English font
const unifrakturMaguntia = UnifrakturMaguntia({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-unifraktur',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Reaper Crew",
  description: "Tactical gear and media packages",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${unifrakturMaguntia.variable} dark`}>
      <body className="bg-black text-white antialiased flex flex-col min-h-screen">
        <ToastProvider>
          <CartProvider>
            {children}
            <ToastContainer />
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}