import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://poker.divingbase.tech'),

  title: {
    default: 'Scrum Poker Online - 登録不要・完全無料のスクラムポーカー',
    template: '%s | Scrum Poker Online',
  },
  description: 'アジャイル開発・スクラム開発の見積もりを効率化。ログイン不要ですぐに使える、シンプルで軽量なスクラムポーカーツールです。',

  // Facebook, Slack, LINE用
  openGraph: {
    title: 'Scrum Poker Online',
    description: 'チームで見積もり、サクッと合意。',
    url: '/',
    siteName: 'Scrum Poker Online',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/ogp.png', // publicフォルダの画像
        width: 1200,
        height: 630,
        alt: 'Scrum Poker App Preview',
      },
    ],
  },

  // X (旧Twitter)用
  twitter: {
    card: 'summary_large_image',
    title: 'Scrum Poker Online',
    description: '登録不要・インストール不要ですぐに使えるスクラムポーカー。',
    images: ['/ogp.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider />
        {children}
      </body>
    </html>
  );
}
