import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Krona_One } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://itemio.vercel.app";
const siteTitle = "Itemio | Find Item Prices & Compare Prices of Items";
const siteDescription =
  "Find item prices and compare prices of items across Indian marketplaces with Itemio. Search by product photo or item name before you buy.";
const socialImage = "/og-image.png";

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
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Itemio",
  },
  description: siteDescription,
  applicationName: "Itemio",
  authors: [{ name: "Itemio" }],
  creator: "Itemio",
  publisher: "Itemio",
  category: "Shopping",
  keywords: [
    "Itemio",
    "find item prices",
    "compare prices of items",
    "price comparison India",
    "compare item prices India",
    "photo price search",
    "product price finder",
    "Indian marketplace comparison",
    "shopping price finder",
    "Amazon Flipkart price comparison",
    "find cheapest item online",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/itemio-logo.png",
    apple: "/itemio-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Itemio",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Itemio price comparison preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Itemio",
    url: siteUrl,
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Web",
    description: siteDescription,
    image: new URL(socialImage, siteUrl).toString(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl.replace(/\/$/, "")}/discover?mode=browse&q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${kronaOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
