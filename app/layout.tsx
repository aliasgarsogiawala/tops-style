import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tops Style — Invoice & Billing",
  description: "Invoice and billing software for Tops Style Jewellery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-zinc-50 min-h-screen text-zinc-900`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto ml-64 print:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
