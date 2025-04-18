import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import SessionProvider from "./session-provider";
import type { Metadata } from "next";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bergenfield Dominoes Tournament",
  description: "64-player dominoes tournament management system"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
        <Navbar />
        <div
          style={{
            position: "relative",
            minHeight: "100vh"
          }}
        >
          <SessionProvider>{children}</SessionProvider>
          <Footer />
        </div>
      </body>
    </html>
  );
}
