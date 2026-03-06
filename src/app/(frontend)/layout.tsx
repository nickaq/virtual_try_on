import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/frontend/lib/cartContext";
import Header from "@/frontend/components/Header";
import Footer from "@/frontend/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StyleAI - AI-Powered Fashion Store",
  description: "Магазин одежды с AI стилистом и виртуальной примеркой",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
