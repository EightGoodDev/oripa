import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import QueryProvider from "@/components/providers/QueryProvider";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  preload: false,
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ORIPA - オンラインオリパ",
  description:
    "人気スニーカー・トレカ・フィギュアが当たるオンラインオリパ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} font-sans bg-slate-900 text-white antialiased`}
      >
        <Toaster theme="dark" position="top-right" richColors />
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
