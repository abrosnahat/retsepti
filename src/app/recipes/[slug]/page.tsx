import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ChefHat, Clock, Users, ArrowLeft, Calendar } from "lucide-react";
import Footer from "@/components/footer";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Instruction {
  step?: number;
  description: string;
}

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getRecipe(slug: string) {
  const recipe = await prisma.recipe.findUnique({
    where: {
      slug,
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
  });

  return recipe;
}

export async function generateMetadata({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    return {
      title: "Рецепт не найден",
    };
  }

  return {
    title: recipe.title,
    description:
      recipe.description ||
      `${
        recipe.title
      } - Рецепт с пошаговыми инструкциями и фотографиями. Время приготовления: ${
        (recipe.prepTime || 0) + (recipe.cookTime || 0)
      } минут.`,
    keywords: [
      recipe.title,
      "рецепт",
      recipe.category.name,
      "пошаговый рецепт",
      "рецепт с фото",
      "как приготовить",
    ],
    openGraph: {
      title: recipe.title,
      description:
        recipe.description ||
        `Рецепт ${recipe.title} с пошаговыми инструкциями`,
      type: "article",
      url: `/recipes/${recipe.slug}`,
      images: recipe.mainImage
        ? [
            {
              url: recipe.mainImage,
              width: 1200,
              height: 630,
              alt: recipe.title,
            },
          ]
        : [],
      publishedTime: recipe.createdAt,
      modifiedTime: recipe.updatedAt,
      authors: [recipe.author.name || "Рецепты"],
      section: recipe.category.name,
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description:
        recipe.description ||
        `Рецепт ${recipe.title} с пошаговыми инструкциями`,
      images: recipe.mainImage ? [recipe.mainImage] : [],
      creator: "@recipes",
    },
    alternates: {
      canonical: `/recipes/${recipe.slug}`,
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const ingredients: Ingredient[] = recipe.ingredients
    ? JSON.parse(recipe.ingredients)
    : [];
  const instructions: Instruction[] = recipe.instructions
    ? JSON.parse(recipe.instructions)
    : [];

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://retsepti.ge";

  // Структурированные данные Recipe Schema
  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description || "",
    image: recipe.mainImage ? [recipe.mainImage] : [],
    author: {
      "@type": "Person",
      name: recipe.author.name || "Рецепты",
    },
    datePublished: recipe.createdAt,
    dateModified: recipe.updatedAt,
    prepTime: recipe.prepTime ? `PT${recipe.prepTime}M` : undefined,
    cookTime: recipe.cookTime ? `PT${recipe.cookTime}M` : undefined,
    totalTime: totalTime ? `PT${totalTime}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} порций` : undefined,
    recipeCategory: recipe.category.name,
    recipeCuisine: "Русская",
    recipeIngredient: ingredients.map(
      (ing) => `${ing.name} - ${ing.amount} ${ing.unit}`
    ),
    recipeInstructions: instructions.map((inst, index) => ({
      "@type": "HowToStep",
      position: inst.step || index + 1,
      text: inst.description,
    })),
    keywords: `${recipe.title}, рецепт, ${recipe.category.name}, пошаговый рецепт`,
    aggregateRating: recipe.featured
      ? {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "1",
        }
      : undefined,
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Рецепты",
        item: `${baseUrl}/recipes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: recipe.category.name,
        item: `${baseUrl}/categories/${recipe.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: recipe.title,
        item: `${baseUrl}/recipes/${recipe.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      {/* Структурированные данные JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold text-gray-800">Рецепты</span>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-700 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>На главную</span>
          </Link>
        </div>
      </nav>

      <div className="pt-20">
        {/* Hero Section */}
        <div className="relative">
          {recipe.mainImage && (
            <div className="aspect-[21/9] w-full relative overflow-hidden">
              <Image
                src={recipe.mainImage}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}

          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-6">
              <div className="max-w-4xl mx-auto">
                <div className="glass rounded-xl p-8">
                  <div className="flex items-center text-sm text-rose-600 mb-4">
                    <Link
                      href={`/categories/${recipe.category.slug}`}
                      className="hover:underline"
                    >
                      {recipe.category.name}
                    </Link>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    {recipe.title}
                  </h1>
                  {recipe.description && (
                    <p className="text-xl text-gray-600 mb-6">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    {totalTime > 0 && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Общее время: {totalTime} мин</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Порций: {recipe.servings}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Автор: {recipe.author.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Cooking Times */}
              {(recipe.prepTime || recipe.cookTime) && (
                <div className="glass rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Время приготовления
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {recipe.prepTime && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-600">
                          {recipe.prepTime}
                        </div>
                        <div className="text-gray-600">мин подготовки</div>
                      </div>
                    )}
                    {recipe.cookTime && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-600">
                          {recipe.cookTime}
                        </div>
                        <div className="text-gray-600">мин готовки</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {instructions.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Пошаговые инструкции
                  </h2>
                  <div className="space-y-6">
                    {instructions.map(
                      (instruction: Instruction, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-sm font-bold text-rose-600 flex-shrink-0">
                            {instruction.step || index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">
                              {instruction.description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Description */}
              {recipe.content && (
                <div className="glass rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Подробное описание
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: recipe.content }}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recipe Info */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Информация о рецепте
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Категория:</span>
                    <span className="text-gray-800">
                      {recipe.category.name}
                    </span>
                  </div>
                  {recipe.difficulty && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сложность:</span>
                      <span className="text-gray-800">
                        {recipe.difficulty === "easy" && "Легко"}
                        {recipe.difficulty === "medium" && "Средне"}
                        {recipe.difficulty === "hard" && "Сложно"}
                      </span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Порций:</span>
                      <span className="text-gray-800">{recipe.servings}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Автор:</span>
                    <span className="text-gray-800">{recipe.author.name}</span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              {ingredients.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Ингредиенты
                  </h3>
                  <ul className="space-y-2">
                    {ingredients.map(
                      (ingredient: Ingredient, index: number) => (
                        <li
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {ingredient.name}
                          </span>
                          <span className="text-gray-600">
                            {ingredient.amount} {ingredient.unit}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
