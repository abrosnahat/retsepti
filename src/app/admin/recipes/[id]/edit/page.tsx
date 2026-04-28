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
import {
  ChefHat,
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Instruction {
  id: string;
  step: number;
  description: string;
}

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  ingredients: string;
  instructions: string;
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

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { id: "1", step: 1, description: "" },
  ]);

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

      // Парсим ингредиенты
      try {
        const parsed = recipe.ingredients ? JSON.parse(recipe.ingredients) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIngredients(
            parsed.map(
              (
                ing: { name?: string; amount?: string; unit?: string },
                idx: number
              ) => ({
                id: String(idx + 1),
                name: ing.name || "",
                amount: ing.amount || "",
                unit: ing.unit || "",
              })
            )
          );
        }
      } catch (e) {
        console.error("Error parsing ingredients:", e);
      }

      // Парсим инструкции
      try {
        const parsed = recipe.instructions
          ? JSON.parse(recipe.instructions)
          : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInstructions(
            parsed.map(
              (
                inst: { step?: number; description?: string },
                idx: number
              ) => ({
                id: String(idx + 1),
                step: inst.step || idx + 1,
                description: inst.description || "",
              })
            )
          );
        }
      } catch (e) {
        console.error("Error parsing instructions:", e);
      }
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

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", amount: "", unit: "" },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (
    id: string,
    field: keyof Ingredient,
    value: string
  ) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      {
        id: Date.now().toString(),
        step: instructions.length + 1,
        description: "",
      },
    ]);
  };

  const removeInstruction = (id: string) => {
    const filtered = instructions.filter((inst) => inst.id !== id);
    const reordered = filtered.map((inst, index) => ({
      ...inst,
      step: index + 1,
    }));
    setInstructions(reordered);
  };

  const updateInstruction = (id: string, description: string) => {
    setInstructions(
      instructions.map((inst) =>
        inst.id === id ? { ...inst, description } : inst
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.categoryId) {
      setError("Заполните все обязательные поля");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const slug = generateSlug(formData.title);

      const response = await fetch(`/api/admin/recipes/${recipeId}/edit`, {
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
          ingredients: JSON.stringify(
            ingredients.filter((ing) => ing.name.trim())
          ),
          instructions: JSON.stringify(
            instructions.filter((inst) => inst.description.trim())
          ),
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

            {/* Ингредиенты */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Ингредиенты
                </h2>
                <Button
                  type="button"
                  onClick={addIngredient}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-4">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Input
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Название ингредиента"
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        value={ingredient.amount}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            "amount",
                            e.target.value
                          )
                        }
                        placeholder="500"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        value={ingredient.unit}
                        onChange={(e) =>
                          updateIngredient(
                            ingredient.id,
                            "unit",
                            e.target.value
                          )
                        }
                        placeholder="г"
                      />
                    </div>
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Инструкции */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Пошаговые инструкции
                </h2>
                <Button
                  type="button"
                  onClick={addInstruction}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить шаг
                </Button>
              </div>

              <div className="space-y-4">
                {instructions.map((instruction) => (
                  <div key={instruction.id} className="flex gap-4 items-start">
                    <div className="w-12 h-10 bg-rose-100 rounded-md flex items-center justify-center text-sm font-semibold text-rose-600">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={instruction.description}
                        onChange={(e) =>
                          updateInstruction(instruction.id, e.target.value)
                        }
                        placeholder="Описание шага..."
                        rows={2}
                      />
                    </div>
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeInstruction(instruction.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Подробное описание */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Подробное описание
              </h2>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Добавьте подробное описание рецепта, советы по приготовлению, историю блюда и другую полезную информацию..."
              />
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
