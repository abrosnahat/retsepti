"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChefHat, ArrowLeft, Plus, BookOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    recipes: number;
  };
}

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
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
      fetchCategories();
    }
  }, [session]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError("Ошибка при загрузке категорий");
      }
    } catch (error) {
      setError("Ошибка при загрузке категорий");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setError("Введите название категории");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ошибка при создании категории");
      }
    } catch (error) {
      setError("Ошибка при создании категории");
      console.error("Error creating category:", error);
    } finally {
      setIsCreating(false);
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
              Управление категориями
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Категории</h1>
            <p className="text-gray-600">Управляйте категориями рецептов</p>
          </div>

          {/* Create Category Form */}
          <div className="glass rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Создать новую категорию
            </h2>
            <form onSubmit={createCategory} className="flex gap-4">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Название категории"
                className="flex-1 glass placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={isCreating}
                className="glass hover:bg-white/40 text-gray-800 font-semibold"
              >
                {isCreating ? (
                  "Создание..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать
                  </>
                )}
              </Button>
            </form>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center glass rounded-xl p-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Категории не найдены
              </h3>
              <p className="text-gray-500">Создайте первую категорию</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 mb-4">
                <p className="text-gray-600">
                  Всего категорий:{" "}
                  <span className="font-semibold">{categories.length}</span>
                </p>
              </div>

              {categories.map((category) => (
                <div key={category.id} className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {category.name}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Slug:{" "}
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {category.slug}
                          </span>
                        </p>
                        <p>
                          Рецептов:{" "}
                          <span className="font-semibold">
                            {category._count?.recipes || 0}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/categories/${category.slug}`}
                        target="_blank"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </Link>
                      {/* TODO: Add edit and delete functionality */}
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
