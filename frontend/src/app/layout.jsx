import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  title: "Scroll",
  description: "Short-form video platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
