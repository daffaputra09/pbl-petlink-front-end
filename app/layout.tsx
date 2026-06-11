import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { AppToaster } from "@/components/AppToaster";
import { ConfirmDialogHost } from "@/components/shared/ConfirmDialogHost";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetLink",
  description: "Aplikasi manajemen klinik hewan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <AppToaster />
        <ConfirmDialogHost />
      </body>
    </html>
  );
}
