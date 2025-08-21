"use client";
import { Geist, Geist_Mono, Goldman, Inter,Poppins,Anton_SC} from "next/font/google";
import "./globals.css";
import Provider from "./context/AuthContext";
import Navbar from "./components/navbar";
import { SessionProvider } from "next-auth/react";
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
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${goldman.variable} ${inter.variable} ${poppins.variable} ${anton.variable} antialiased`}
      >
        <SessionProvider>
          <Navbar />
          <Provider>{children}</Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
