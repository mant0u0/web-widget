// layout.tsx

import type { Metadata } from "next";
import "./globals.scss";
import { Inter, Noto_Sans_TC } from "next/font/google";

// 設定 Inter 字體
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["600", "800", "900"],
  style: ["normal", "italic"],
});

// 設定 Noto Sans TC 字體
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
  display: "swap",
  weight: ["500", "700", "900"],
});

export const metadata: Metadata = {
  title: "網頁小工具",
  description: "發想一些不常用，但可能很有用的網頁小工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
