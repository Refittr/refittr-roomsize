import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import RoomSizeFooter from "@/components/RoomSizeFooter"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "RoomSize by Refittr - Know Your Room Dimensions Instantly",
  description: "Free tool to find exact room dimensions for your house type. No measuring required. Know if it fits before you buy.",
  keywords: ["room dimensions", "house measurements", "room size", "floor area", "wall area", "UK homes", "property dimensions"],
  authors: [{ name: "Refittr" }],
  creator: "Refittr",
  publisher: "Refittr",
  metadataBase: new URL("https://roomsize.refittr.co.uk"),
  openGraph: {
    title: "RoomSize by Refittr - Know Your Room Dimensions Instantly",
    description: "Free tool to find exact room dimensions for your house type. No measuring required. Know if it fits before you buy.",
    url: "https://roomsize.refittr.co.uk",
    siteName: "RoomSize by Refittr",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RoomSize by Refittr - Know Your Room Dimensions Instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoomSize by Refittr - Know Your Room Dimensions Instantly",
    description: "Free tool to find exact room dimensions for your house type. No measuring required.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10B981",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#F8FAFC] text-[#475569] min-h-screen flex flex-col`}>
        <main className="flex-1">
          {children}
        </main>
        <RoomSizeFooter />
        <Analytics />
      </body>
    </html>
  )
}
