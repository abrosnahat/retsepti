import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, Star } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "რეცეპტები - კულინარიული შედევრები",
  description:
    "აღმოაცინეთ და გადახედეთ უგემრიელესი რეცეპტების სამყარო ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით. იპოვეთ იდეალურ რეცეპტს საუზმისთვის, სადილისთვის, ვახშმისა და დესერტისთვის.",
  keywords: [
    "რეცეპტები",
    "კულინარია",
    "მზარეულობა",
    "სახლის სამზარეულო",
    "ნაბიჯ-ნაბიჯ რეცეპტები",
    "რეცეპტები ფოტოებით",
    "მარტივი რეცეპტები",
    "გემრიელი რეცეპტები",
  ],
  openGraph: {
    title: "რეცეპტები - კულინარიული შედევრები",
    description:
      "აღმოაცინეთ და გადახედეთ უგემრიელესი რეცეპტების სამყარო ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "რეცეპტები - კულინარიული შედევრები",
    description:
      "აღმოაცინეთ და გადახედეთ უგემრიელესი რეცეპტების სამყარო ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით.",
  },
  alternates: {
    canonical: "/",
  },
};

async function getLatestRecipes() {
  try {
    return await prisma.recipe.findMany({
      where: {
        published: true,
      },
      include: {
        category: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching latest recipes:", error);
    return [];
  }
}

async function getFeaturedRecipes() {
  try {
    return await prisma.recipe.findMany({
      where: {
        published: true,
        featured: true,
      },
      include: {
        category: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      take: 3,
    });
  } catch (error) {
    console.error("Error fetching featured recipes:", error);
    return [];
  }
}

export default async function Home() {
  const [latestRecipes, featuredRecipes] = await Promise.all([
    getLatestRecipes(),
    getFeaturedRecipes(),
  ]);

  // Структурированные данные для главной страницы
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "რეცეპტები",
    description:
      "საუკეთესო რეცეპტები ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ლამაზი ფოტოებით",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge"
        }/recipes?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "რეცეპტები",
    url: process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge",
    logo: `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge"
    }/logo.png`,
    description: "კულინარიული პორტალი საუკეთესო რეცეპტებით ნებისმიერი შემთხვევისთვის",
  };

  return (
    <div className="min-h-screen">
      {/* Структурированные данные JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold text-gray-800">რეცეპტები</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/recipes"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              ყველა რეცეპტი
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              კატეგორიები
            </Link>
            <Link
              href="/admin"
              className="glass px-4 py-2 rounded-lg text-gray-700 hover:bg-white/30 transition-colors"
            >
              ადმინი
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            კულინარიული
            <span className="block text-rose-600">შედევრები</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            აღმოაცინეთ და გადახედეთ უგემრიელესი რეცეპტების სამყარო ნაბიჯ-ნაბიჯ
            ინსტრუქციებითა და ლამაზი ფოტოებით
          </p>
          <Link
            href="/recipes"
            className="inline-block glass px-8 py-4 text-lg font-semibold text-gray-800 rounded-xl hover:bg-white/40 transition-all transform hover:scale-105"
          >
            რეცეპტების ნახვა
          </Link>
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              რეკომენდებული რეცეპტები
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <div className="absolute top-4 left-4 z-10 flex items-center text-sm text-rose-600 bg-white/90 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 mr-1" />
                    რეკომენდირებული
                  </div>
                  <RecipeCard recipe={recipe} showCategory />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Recipes */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            ბოლო რეცეპტები
          </h2>
          {latestRecipes.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                რეცეპტები მალე გამოჭნდება
              </h3>
              <p className="text-gray-500">
                ჩვენ ვმუშაობთ თქვენთვის გემრიელი რეცეპტების დამატებაზე
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} showCategory />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
