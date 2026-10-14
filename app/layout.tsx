import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingActionDock from "@/components/ui/FloatingActionDock";
import CustomCursor from "@/components/ui/CustomCursor";
import SplashScreen from "@/components/ui/SplashScreen";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Self-hosted Playfair Display (serif) — avoids Google Fonts network dependency
const playfair = localFont({
  src: [
    { path: "../public/fonts/playfair-display-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/playfair-display-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/playfair-display-700.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/playfair-display-800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

// Self-hosted Plus Jakarta Sans (sans-serif)
const jakarta = localFont({
  src: [
    { path: "../public/fonts/plus-jakarta-sans-400.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/plus-jakarta-sans-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/plus-jakarta-sans-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/plus-jakarta-sans-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "MSI Group of Institutes | Crafting Legal Brilliance, Creating a Better Nation",
    template: "%s | MSI Group of Institutes",
  },
  description:
    "MSI Group of Institutes is Kharar & Mohali's premier law coaching institute for PCS (Judicial Services), CLAT (UG & PG), PU Law Entrance, AILET, AIBE, and UGC NET Law. Over 300+ selections.",
  keywords: [
    "MSI Group of Institutes",
    "MSI Law Institute",
    "PCS J Coaching Mohali",
    "CLAT Coaching Kharar",
    "PU Law Entrance Coaching",
    "Judicial Services Coaching Punjab",
    "AILET Coaching",
    "UGC NET Law Coaching",
    "Law Entrance Institute Mohali",
    "Best Law Coaching Chandigarh",
  ],
  authors: [{ name: "MSI Group of Institutes" }],
  creator: "MSI Group of Institutes",
  publisher: "MSI Group of Institutes",
  metadataBase: new URL("https://msiinstitutes.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://msiinstitutes.com",
    siteName: "MSI Group of Institutes",
    title: "MSI Group of Institutes | Crafting Legal Brilliance, Creating a Better Nation",
    description:
      "Premier coaching institute for PCS (Judicial Services), CLAT (UG & PG), PU Law Entrance, AILET, and UGC NET Law in Kharar, Mohali.",
    images: [
      {
        url: "/images/msi-crest.png",
        width: 1200,
        height: 630,
        alt: "MSI Group of Institutes Official Seal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MSIInstitutes",
    title: "MSI Group of Institutes | Crafting Legal Brilliance, Creating a Better Nation",
    description:
      "Premier coaching institute for PCS (Judicial Services), CLAT (UG & PG), PU Law Entrance, AILET, and UGC NET Law in Kharar, Mohali.",
    images: ["/images/msi-crest.png"],
  },
  icons: {
    icon: "/images/msi-crest.png",
    apple: "/images/msi-crest.png",
    shortcut: "/images/msi-crest.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#FFF9EF] text-[#10233F] antialiased selection:bg-[#EFC988] selection:text-[#89190E]">
        <SplashScreen />
        <CustomCursor />
        {children}
        <FloatingActionDock />
      </body>
    </html>
  );
}
