"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ChefHat, ArrowLeft, Save, Plus, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
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

export default function NewRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [prepTime, setPrepTime] = useState<number | "">("");
  const [cookTime, setCookTime] = useState<number | "">("");
  const [servings, setServings] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState("easy");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { id: "1", step: 1, description: "" },
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/admin");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Автоматическое создание slug из заголовка
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[а-я]/g, (char) => {
          const map: { [key: string]: string } = {
            а: "a",
            б: "b",
            в: "v",
            г: "g",
            д: "d",
            е: "e",
            ё: "yo",
            ж: "zh",
            з: "z",
            и: "i",
            й: "y",
            к: "k",
            л: "l",
            м: "m",
            н: "n",
            о: "o",
            п: "p",
            р: "r",
            с: "s",
            т: "t",
            у: "u",
            ф: "f",
            х: "h",
            ц: "ts",
            ч: "ch",
            ш: "sh",
            щ: "sch",
            ъ: "",
            ы: "y",
            ь: "",
            э: "e",
            ю: "yu",
            я: "ya",
          };
          return map[char] || char;
        })
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(generatedSlug);
    }
  }, [title]);

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

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: "",
      amount: "",
      unit: "",
    };
    setIngredients([...ingredients, newIngredient]);
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
    const newInstruction: Instruction = {
      id: Date.now().toString(),
      step: instructions.length + 1,
      description: "",
    };
    setInstructions([...instructions, newInstruction]);
  };

  const removeInstruction = (id: string) => {
    const filtered = instructions.filter((inst) => inst.id !== id);
    // Пересчитываем номера шагов
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
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          mainImage: mainImage || null,
          prepTime: prepTime || null,
          cookTime: cookTime || null,
          servings: servings || null,
          difficulty,
          categoryId,
          published,
          featured,
          ingredients: JSON.stringify(
            ingredients.filter((ing) => ing.name.trim())
          ),
          instructions: JSON.stringify(
            instructions.filter((inst) => inst.description.trim())
          ),
        }),
      });

      if (response.ok) {
        await response.json();
        router.push(`/admin/recipes`);
      } else {
        const errorData = await response.json();
        console.error("Recipe creation error:", errorData);
        setError(errorData.error || "Произошла ошибка при создании рецепта");
      }
    } catch {
      setError("Произошла ошибка при создании рецепта");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
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
              Новый рецепт
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Основная информация */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Основная информация
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название рецепта *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Борщ украинский"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL (slug)
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="borsch-ukrainskiy"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Краткое описание
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание рецепта..."
                  rows={3}
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL главного изображения
                </label>
                <Input
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время подготовки (мин)
                  </label>
                  <Input
                    type="number"
                    value={prepTime}
                    onChange={(e) =>
                      setPrepTime(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="30"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время готовки (мин)
                  </label>
                  <Input
                    type="number"
                    value={cookTime}
                    onChange={(e) =>
                      setCookTime(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="60"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Порций
                  </label>
                  <Input
                    type="number"
                    value={servings}
                    onChange={(e) =>
                      setServings(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="4"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сложность
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-white/20 backdrop-blur-md border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="easy">Легко</option>
                    <option value="medium">Средне</option>
                    <option value="hard">Сложно</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-white/20 backdrop-blur-md border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                content={content}
                onChange={setContent}
                placeholder="Добавьте подробное описание рецепта, советы по приготовлению, историю блюда и другую полезную информацию..."
              />
            </div>

            {/* Настройки публикации */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Настройки публикации
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-rose-600 bg-white/20 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label
                    htmlFor="published"
                    className="text-sm font-medium text-gray-700"
                  >
                    Опубликовать рецепт
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-rose-600 bg-white/20 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700"
                  >
                    Рекомендуемый рецепт
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin">
                <Button variant="ghost" className="text-gray-700">
                  Отмена
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || !title || !categoryId}
                className="glass hover:bg-white/40 text-gray-800 font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить рецепт
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
