import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, ArrowLeft, BookOpen } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import Footer from "@/components/footer";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mainImage: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string | null;
  author: {
    name: string | null;
  };
}

interface CategoryWithRecipes {
  id: string;
  name: string;
  slug: string;
  recipes: Recipe[];
}

async function getCategory(slug: string): Promise<CategoryWithRecipes | null> {
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
    include: {
      recipes: {
        where: {
          published: true,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return category;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Категория не найдена",
    };
  }

  return {
    title: `${category.name} - Рецепты`,
    description: `Рецепты в категории ${
      category.name
    }. Найдите лучшие рецепты ${category.name.toLowerCase()}.`,
    openGraph: {
      title: `${category.name} - Рецепты`,
      description: `Рецепты в категории ${category.name}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/categories" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700 hover:text-rose-600 transition-colors">
                Категории
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-rose-600" />
            <span className="text-lg font-bold text-gray-800">
              {category.name}
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-gray-600">
              {category.recipes.length} рецепт
              {category.recipes.length === 1
                ? ""
                : category.recipes.length < 5
                ? "а"
                : "ов"}{" "}
              в этой категории
            </p>
          </div>

          {/* Recipes Grid */}
          {category.recipes.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Рецепты не найдены
              </h3>
              <p className="text-gray-500 mb-6">
                В этой категории пока нет опубликованных рецептов
              </p>
              <Link
                href="/recipes"
                className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-lg hover:bg-white/40 transition-all transform hover:scale-105"
              >
                <BookOpen className="h-5 w-5 text-rose-600" />
                <span className="text-gray-800 font-medium">Все рецепты</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex justify-center space-x-4 mt-12">
            <Link
              href="/categories"
              className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-lg hover:bg-white/40 transition-all transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 text-rose-600" />
              <span className="text-gray-800 font-medium">Все категории</span>
            </Link>
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
