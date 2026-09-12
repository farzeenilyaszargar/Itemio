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
  title: "Kitne Rupay",
  description: "Photo-first Indian marketplace price comparison.",
  icons: {
    icon: "/kitne-rupay-logo.png",
    apple: "/kitne-rupay-logo.png",
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
