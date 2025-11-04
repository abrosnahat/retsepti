import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, ArrowLeft, BookOpen } from "lucide-react";
import Footer from "@/components/footer";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    recipes: number;
  };
}

async function getCategories(): Promise<Category[]> {
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
}

export const metadata = {
  title: "Категории рецептов - Рецепты",
  description:
    "Все категории рецептов. Найдите рецепты по интересующей вас категории.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
            <span className="text-gray-700 hover:text-rose-600 transition-colors">
              На главную
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-rose-600" />
            <span className="text-lg font-bold text-gray-800">Категории</span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Категории рецептов
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Выберите интересующую вас категорию и найдите идеальный рецепт
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Категории не найдены
              </h3>
              <p className="text-gray-500">Пока что категории не созданы</p>
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
                        {category._count?.recipes || 0} рецепт
                        {category._count?.recipes === 1
                          ? ""
                          : category._count?.recipes &&
                            category._count.recipes < 5
                          ? "а"
                          : "ов"}
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
              <span className="text-gray-800 font-medium">Все рецепты</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
