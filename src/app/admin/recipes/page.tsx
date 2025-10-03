"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Clock,
  Users,
} from "lucide-react";

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
  published: boolean;
  featured: boolean;
  category: {
    id: string;
    name: string;
  };
  author: {
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminRecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/admin");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchRecipes();
    }
  }, [session]);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/recipes");

      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        setError("Ошибка при загрузке рецептов");
      }
    } catch (error) {
      setError("Ошибка при загрузке рецептов");
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublished = async (recipeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        setRecipes(
          recipes.map((recipe) =>
            recipe.id === recipeId
              ? { ...recipe, published: !currentStatus }
              : recipe
          )
        );
      } else {
        alert("Ошибка при изменении статуса публикации");
      }
    } catch (error) {
      alert("Ошибка при изменении статуса публикации");
      console.error("Error toggling published status:", error);
    }
  };

  const toggleFeatured = async (recipeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: !currentStatus }),
      });

      if (response.ok) {
        setRecipes(
          recipes.map((recipe) =>
            recipe.id === recipeId
              ? { ...recipe, featured: !currentStatus }
              : recipe
          )
        );
      } else {
        alert("Ошибка при изменении статуса рекомендации");
      }
    } catch (error) {
      alert("Ошибка при изменении статуса рекомендации");
      console.error("Error toggling featured status:", error);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот рецепт?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
      } else {
        alert("Ошибка при удалении рецепта");
      }
    } catch (error) {
      alert("Ошибка при удалении рецепта");
      console.error("Error deleting recipe:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-xl p-8 text-center">
          <ChefHat className="h-16 w-16 text-rose-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700 hover:text-rose-600 transition-colors">
                Назад к админке
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-rose-600" />
            <span className="text-lg font-bold text-gray-800">
              Управление рецептами
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Все рецепты
              </h1>
              <p className="text-gray-600">
                Управляйте всеми рецептами на сайте
              </p>
            </div>
            <Link href="/admin/recipes/new">
              <Button className="glass hover:bg-white/40 text-gray-800 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Новый рецепт
              </Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {recipes.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Рецепты не найдены
              </h3>
              <p className="text-gray-500 mb-6">
                Начните с создания первого рецепта
              </p>
              <Link href="/admin/recipes/new">
                <Button className="glass hover:bg-white/40 text-gray-800 font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать рецепт
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 mb-4">
                <p className="text-gray-600">
                  Всего рецептов:{" "}
                  <span className="font-semibold">{recipes.length}</span>
                </p>
              </div>

              {recipes.map((recipe) => (
                <div key={recipe.id} className="glass rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        {recipe.mainImage && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <Image
                              src={recipe.mainImage}
                              alt={recipe.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {recipe.title}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {recipe.published ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Опубликован
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Черновик
                                </span>
                              )}
                              {recipe.featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Рекомендуемый
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">
                              {recipe.category.name}
                            </span>
                            {recipe.author.name && (
                              <>
                                {" • Автор: "}
                                <span className="font-medium">
                                  {recipe.author.name}
                                </span>
                              </>
                            )}
                          </div>
                          {recipe.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {(recipe.prepTime || recipe.cookTime) && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {recipe.prepTime && recipe.cookTime
                                  ? `${recipe.prepTime + recipe.cookTime} мин`
                                  : `${recipe.prepTime || recipe.cookTime} мин`}
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {recipe.servings} порций
                              </div>
                            )}
                            <div>
                              Создан:{" "}
                              {new Date(recipe.createdAt).toLocaleDateString(
                                "ru-RU"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link href={`/recipes/${recipe.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/recipes/${recipe.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          togglePublished(recipe.id, recipe.published)
                        }
                        className={
                          recipe.published
                            ? "text-green-600 hover:text-green-700"
                            : "text-gray-600 hover:text-gray-700"
                        }
                      >
                        {recipe.published ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleFeatured(recipe.id, recipe.featured)
                        }
                        className={
                          recipe.featured
                            ? "text-yellow-600 hover:text-yellow-700"
                            : "text-gray-600 hover:text-gray-700"
                        }
                      >
                        {recipe.featured ? (
                          <Star className="h-4 w-4" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecipe(recipe.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
