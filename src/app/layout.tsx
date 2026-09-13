import type { Metadata } from "next";
import { Geist, Geist_Mono, Krona_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kronaOne = Krona_One({
  variable: "--font-krona-one",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  title: "Itemio | Find Item Prices & Compare Prices of Items",
  description: "Itemio helps shoppers compare prices across Indian marketplaces from a product photo or search.",
  applicationName: "Itemio",
  keywords: [
    "Itemio",
    "price comparison India",
    "photo price search",
    "Indian marketplace comparison",
    "shopping price finder",
  ],
  icons: {
    icon: "/itemio-logo.png",
    apple: "/itemio-logo.png",
  },
  openGraph: {
    title: "Itemio | Find Item Prices & Compare Prices of Items",
    description: "Compare prices across Indian marketplaces from a product photo or search.",
    siteName: "Itemio",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Itemio price comparison preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Itemio | Find Item Prices & Compare Prices of Items",
    description: "Compare prices across Indian marketplaces from a product photo or search.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${kronaOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
