import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, ArrowLeft } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import Footer from "@/components/footer";
import type { Metadata } from "next";

async function getAllRecipes() {
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
    });
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: "ყველა რეცეპტი",
  description:
    "ყველა რეცეპტის სრული კატალოგი ნაბიჯ-ნაბიჯ ინსტრუქციებით. აირჩიეთ რეცეპტი საუზმისთვის, სადილისთვის, ვახშმისა თუ დესერტისთვის. მარტივი და გემრიელი რეცეპტები ნებისმიერ გემოვნებაზე.",
  keywords: [
    "ყველა რეცეპტი",
    "რეცეპტების კატალოგი",
    "რეცეპტები ფოტოებით",
    "ნაბიჯ-ნაბიჯ რეცეპტები",
    "საშინაო სამზარეულო",
    "მარტივი რეცეპტები",
  ],
  openGraph: {
    title: "ყველა რეცეპტი - სრული კატალოგი",
    description:
      "ყველა რეცეპტის სრული კატალოგი ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ფოტოებით",
    type: "website",
    url: "/recipes",
  },
  twitter: {
    card: "summary_large_image",
    title: "ყველა რეცეპტი - სრული კატალოგი",
    description:
      "ყველა რეცეპტის სრული კატალოგი ნაბიჯ-ნაბიჯ ინსტრუქციებითა და ფოტოებით",
  },
  alternates: {
    canonical: "/recipes",
  },
};

export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  // Структурированные данные для списка рецептов
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: recipes.slice(0, 10).map((recipe, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Recipe",
        name: recipe.title,
        description: recipe.description || "",
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge"
        }/recipes/${recipe.slug}`,
        image: recipe.mainImage || "",
      },
    })),
  };

  return (
    <div className="min-h-screen">
      {/* Структурированные данные JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold text-gray-800">რეცეპტები</span>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-700 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>მთავარზე</span>
          </Link>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              ყველა რეცეპტი
            </h1>
            <p className="text-xl text-gray-600">
              ჩვენი კულინარიული შედევრების სრული კატალოგი
            </p>
          </div>

          {recipes.length === 0 ? (
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
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  ნაპოვნია რეცეპტი:{" "}
                  <span className="font-semibold">{recipes.length}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} showCategory />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
