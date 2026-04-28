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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge"
  ),
  title: {
    default: "რეცეპტები - კულინარიული შედევრები",
    template: "%s | რეცეპტები",
  },
  description:
    "საუკეთესო რეცეპტები ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით. იპოვეთ იდეალური რეცეპტი ნებისმიერი შემთხვევისთვის.",
  keywords: [
    "რეცეპტები",
    "კულინარია",
    "მზარეულობა",
    "საჭმელი",
    "სამზარეულო",
    "ნაბიჯ-ნაბიჯ რეცეპტები",
    "რეცეპტები ფოტოებით",
    "საშინაო სამზარეულო",
  ],
  authors: [{ name: "რეცეპტები" }],
  creator: "რეცეპტები",
  publisher: "რეცეპტები",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: "/",
    siteName: "რეცეპტები",
    title: "რეცეპტები - კულინარიული შედევრები",
    description:
      "საუკეთესო რეცეპტები ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით. იპოვეთ იდეალური რეცეპტი ნებისმიერი შემთხვევისთვის.",
  },
  twitter: {
    card: "summary_large_image",
    title: "რეცეპტები - კულინარიული შედევრები",
    description:
      "საუკეთესო რეცეპტები ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით.",
    creator: "@recipes",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ka">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <div className="fixed inset-0 bg-gradient-to-br from-rose-100 via-blue-50 to-purple-100 -z-10" />
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
