import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "./session-provider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Рецепты - Кулинарные шедевры",
  description:
    "Лучшие рецепты с пошаговыми инструкциями и красивыми фотографиями",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <div className="fixed inset-0 bg-gradient-to-br from-rose-100 via-blue-50 to-purple-100 -z-10" />
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
