import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { satoshi } from "../fonts/font";
import { ClerkProvider } from "@clerk/nextjs";

const geistKarla = Karla({
  variable: "--font-geist-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipSync - Your Best Screen Recording App",
  description: "A Screen Sharing and video recording App",
  icons: {
    icon: "/assets/icons/logo.svg",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistKarla.variable} ${satoshi.variable} font-karla antialiased`}
      >
        <ClerkProvider appearance={{ variables: { colorPrimary: '#171717' }}} >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
