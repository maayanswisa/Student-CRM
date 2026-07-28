import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-sans",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "CRM למורים פרטיים",
  description: "ניהול תלמידים, שיעורים וגבייה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
