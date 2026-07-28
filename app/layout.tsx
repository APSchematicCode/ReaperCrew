import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@fontsource/unifrakturmaguntia'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext' // ✅ Import
import ToastContainer from '@/components/Toast'        // ✅ Import
import Footer from '@/components/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reaper Crew",
  description: "Tactical gear and media packages",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-black text-white antialiased flex flex-col min-h-screen">
        <ToastProvider>  {/* ✅ Wrap everything */}
          <CartProvider>
            {children}
            <ToastContainer /> {/* ✅ Renders toasts */}
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  )
}