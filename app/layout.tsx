import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { IntroAnimation } from "@/components/layout/intro-animation";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GCET Nexus — Connect. Collaborate. Build.",
  description:
    "The builder network for Geethanjali College of Engineering and Technology. Find teammates, showcase projects, build your record.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider>
          <IntroAnimation>{children}</IntroAnimation>
        </ThemeProvider>
      </body>
    </html>
  );
}
