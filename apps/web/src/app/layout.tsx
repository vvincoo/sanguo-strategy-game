import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'War Dominion',
  description: '原创大型战争策略类网页游戏骨架'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
