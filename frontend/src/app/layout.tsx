import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Pack",
  description: "旅行の持ち物を自動で最適化するアシスタント",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
