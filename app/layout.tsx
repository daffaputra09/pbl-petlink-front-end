import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { AppToaster } from "@/components/AppToaster";
import { ConfirmDialogHost } from "@/components/shared/ConfirmDialogHost";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetLink — Platform Kesehatan Hewan Peliharaan",
  description:
    "PetLink menghubungkan pemilik hewan, klinik, dan dokter hewan. Booking layanan, konsultasi online, chat, dan pembayaran digital dalam satu platform.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <AppToaster />
        <ConfirmDialogHost />
      </body>
    </html>
  );
}
