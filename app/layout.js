"use client";
import {
  Geist,
  Geist_Mono,
  Goldman,
  Inter,
  Poppins,
  Anton_SC,
} from "next/font/google";
import "./globals.css";
import Provider from "./context/AuthContext";
import Navbar from "./components/navbar";
import { SessionProvider } from "next-auth/react";
import { useThemeStore } from "./store/useThemestore";
import { useEffect } from "react";
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const anton = Anton_SC({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
});
const goldman = Goldman({
  variable: "--font-goldman",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export default function RootLayout({ children }) {
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme);
  const theme = useThemeStore((state) => state.theme);
  useEffect(() => {
    hydrateTheme(); 
  }, [hydrateTheme]);

  return (
    <html lang="en" data-theme={theme}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${goldman.variable} ${inter.variable} ${poppins.variable} ${anton.variable} antialiased`}
      >
        <SessionProvider>
          <Toaster position="top-right" richColors closeButton duration={4000} />
          <Navbar />
          <Provider>{children}</Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
