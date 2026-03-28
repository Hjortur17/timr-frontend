import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/utils/classname";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timr | Skipulagðu vaktir á öruggan hátt",
  description:
    "Skipulagðu vaktir, stjórnaðu starfsmönnum og fylgstu með mætingu — á einum stað.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is" className={cn("font-sans", inter.variable)}>
      <body className={cn(plusJakartaSans.className, "antialiased")}>
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
