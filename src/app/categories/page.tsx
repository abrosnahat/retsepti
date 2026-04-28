import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, ArrowLeft, BookOpen } from "lucide-react";
import Footer from "@/components/footer";
import type { Metadata } from "next";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    recipes: number;
  };
}

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            recipes: {
              where: {
                published: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: "რეცეპტების კატეგორიები",
  description:
    "რეცეპტების ყველა კატეგორია. იპოვეთ რეცეპტები თქვენთვის საინტერესო კატეგორიიდან: საუზმე, სადილი, ვახშამი, დესერტები, ცომედო, სალათები და ბევრი სხვა.",
  keywords: [
    "რეცეპტების კატეგორიები",
    "რეცეპტები კატეგორიების მიხედვით",
    "საუზმეები",
    "სადილები",
    "ვახშმები",
    "დესერტები",
    "ცომედო",
    "სალათები",
  ],
  openGraph: {
    title: "რეცეპტების კატეგორიები",
    description:
      "რეცეპტების ყველა კატეგორია. იპოვეთ რეცეპტები თქვენთვის საინტერესო კატეგორიიდან.",
    type: "website",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "რეცეპტების კატეგორიები",
    description:
      "რეცეპტების ყველა კატეგორია. იპოვეთ რეცეპტები თქვენთვის საინტერესო კატეგორიიდან.",
  },
  alternates: {
    canonical: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Структурированные данные для категорий
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "მთავარი",
        item: process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "კატეგორიები",
        item: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge"
        }/categories`,
      },
    ],
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "რეცეპტების კატეგორიები",
    description:
      "რეცეპტების ყველა კატეგორია. იპოვეთ რეცეპტები თქვენთვის საინტერესო კატეგორიიდან.",
    url: `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge"
    }/categories`,
  };

  return (
    <div className="min-h-screen">
      {/* Структурированные данные JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />

      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
            <span className="text-gray-700 hover:text-rose-600 transition-colors">
              მთავარზე
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-rose-600" />
            <span className="text-lg font-bold text-gray-800">კატეგორიები</span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              რეცეპტების კატეგორიები
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              აირჩიეთ თქვენთვის საინტერესო კატეგორია და იპოვეთ იდეალური რეცეპტი
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                კატეგორიები ვერ მოიძებნა
              </h3>
              <p className="text-gray-500">ჯერჯერობით კატეგორიები შექმნილი არ არის</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <div className="glass rounded-xl p-6 hover:bg-white/40 transition-all transform hover:scale-105 h-full">
                    <div className="text-center">
                      {/* Category Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>

                      {/* Category Name */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                        {category.name}
                      </h3>

                      {/* Recipe Count */}
                      <p className="text-sm text-gray-600">
                        {category._count?.recipes || 0} რეცეპტი
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Back to Recipes */}
          <div className="text-center mt-12">
            <Link
              href="/recipes"
              className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-lg hover:bg-white/40 transition-all transform hover:scale-105"
            >
              <BookOpen className="h-5 w-5 text-rose-600" />
              <span className="text-gray-800 font-medium">ყველა რეცეპტი</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
