import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
