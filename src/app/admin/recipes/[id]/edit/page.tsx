"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ChefHat, ArrowLeft, Save, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  mainImage: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string | null;
  categoryId: string;
  published: boolean;
  featured: boolean;
}

export default function EditRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    mainImage: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    categoryId: "",
    published: false,
    featured: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/admin");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchRecipe();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, recipeId]);

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description || "",
        content: recipe.content,
        mainImage: recipe.mainImage || "",
        prepTime: recipe.prepTime?.toString() || "",
        cookTime: recipe.cookTime?.toString() || "",
        servings: recipe.servings?.toString() || "",
        difficulty: recipe.difficulty || "",
        categoryId: recipe.categoryId,
        published: recipe.published,
        featured: recipe.featured,
      });
    }
  }, [recipe]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}/edit`);

      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      } else {
        setError("Рецепт не найден");
      }
    } catch (error) {
      setError("Ошибка при загрузке рецепта");
      console.error("Error fetching recipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.categoryId
    ) {
      setError("Заполните все обязательные поля");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const slug = generateSlug(formData.title);

      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug,
          prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
          cookTime: formData.cookTime ? parseInt(formData.cookTime) : null,
          servings: formData.servings ? parseInt(formData.servings) : null,
        }),
      });

      if (response.ok) {
        router.push("/admin/recipes");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ошибка при сохранении рецепта");
      }
    } catch (error) {
      setError("Ошибка при сохранении рецепта");
      console.error("Error updating recipe:", error);
    } finally {
      setIsSaving(false);
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

  if (error && !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ошибка</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/admin/recipes">
            <Button>Вернуться к рецептам</Button>
          </Link>
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
            <Link href="/admin/recipes" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700 hover:text-rose-600 transition-colors">
                Назад к рецептам
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-rose-600" />
            <span className="text-lg font-bold text-gray-800">
              Редактировать рецепт
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Основная информация */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Основная информация
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название рецепта *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Введите название рецепта"
                    required
                    className="glass placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Краткое описание
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Краткое описание рецепта"
                    rows={3}
                    className="glass placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Основное изображение (URL)
                  </label>
                  <Input
                    type="url"
                    value={formData.mainImage}
                    onChange={(e) =>
                      setFormData({ ...formData, mainImage: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="glass placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время подготовки (мин)
                    </label>
                    <Input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) =>
                        setFormData({ ...formData, prepTime: e.target.value })
                      }
                      placeholder="30"
                      min="0"
                      className="glass placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время готовки (мин)
                    </label>
                    <Input
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) =>
                        setFormData({ ...formData, cookTime: e.target.value })
                      }
                      placeholder="45"
                      min="0"
                      className="glass placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Количество порций
                    </label>
                    <Input
                      type="number"
                      value={formData.servings}
                      onChange={(e) =>
                        setFormData({ ...formData, servings: e.target.value })
                      }
                      placeholder="4"
                      min="1"
                      className="glass placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сложность
                    </label>
                    <Select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                    >
                      <option value="">Выберите сложность</option>
                      <option value="easy">Легко</option>
                      <option value="medium">Средне</option>
                      <option value="hard">Сложно</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Контент рецепта */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Содержание рецепта
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание, ингредиенты и инструкции *
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>
            </div>

            {/* Настройки публикации */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Настройки публикации
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="published"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Опубликовать рецепт
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="featured"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Рекомендуемый рецепт
                  </label>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/recipes">
                <Button type="button" variant="outline" className="glass">
                  Отмена
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSaving}
                className="glass hover:bg-white/40 text-gray-800 font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
