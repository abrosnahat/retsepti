import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, Clock, Users, Star } from "lucide-react";

async function getLatestRecipes() {
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
}

async function getFeaturedRecipes() {
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
}

export default async function Home() {
  const [latestRecipes, featuredRecipes] = await Promise.all([
    getLatestRecipes(),
    getFeaturedRecipes(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold text-gray-800">Рецепты</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/recipes"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              Все рецепты
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              Категории
            </Link>
            <Link
              href="/admin"
              className="glass px-4 py-2 rounded-lg text-gray-700 hover:bg-white/30 transition-colors"
            >
              Админка
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Кулинарные
            <span className="block text-rose-600">Шедевры</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Откройте для себя мир восхитительных рецептов с пошаговыми
            инструкциями и красивыми фотографиями
          </p>
          <Link
            href="/recipes"
            className="inline-block glass px-8 py-4 text-lg font-semibold text-gray-800 rounded-xl hover:bg-white/40 transition-all transform hover:scale-105"
          >
            Смотреть рецепты
          </Link>
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Рекомендуемые рецепты
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="group"
                >
                  <div className="glass rounded-xl p-6 hover:bg-white/40 transition-all transform hover:scale-105">
                    {recipe.mainImage && (
                      <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                        <img
                          src={recipe.mainImage}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-center text-sm text-rose-600 mb-2">
                      <Star className="h-4 w-4 mr-1" />
                      Рекомендуем
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.prepTime && recipe.cookTime
                          ? `${recipe.prepTime + recipe.cookTime} мин`
                          : "Время не указано"}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {recipe.servings || "не указано"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Recipes */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Последние рецепты
          </h2>
          {latestRecipes.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Рецепты скоро появятся
              </h3>
              <p className="text-gray-500">
                Мы работаем над добавлением вкусных рецептов для вас
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="group"
                >
                  <div className="glass rounded-xl p-6 hover:bg-white/40 transition-all transform hover:scale-105">
                    {recipe.mainImage && (
                      <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                        <img
                          src={recipe.mainImage}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="text-sm text-rose-600 mb-2">
                      {recipe.category.name}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.prepTime && recipe.cookTime
                          ? `${recipe.prepTime + recipe.cookTime} мин`
                          : "Время не указано"}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {recipe.servings || "не указано"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass mt-20 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="h-6 w-6 text-rose-600" />
            <span className="text-xl font-bold text-gray-800">Рецепты</span>
          </div>
          <p className="text-gray-600">
            © 2024 Кулинарные шедевры. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
