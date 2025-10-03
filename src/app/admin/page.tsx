"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Plus,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

// Основная панель администратора
function AdminDashboard() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-rose-600" />
            <span className="text-2xl font-bold text-gray-800">Админка</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              Сайт
            </Link>
            <Button
              onClick={() => {
                // Здесь будет логика выхода
                window.location.href = "/api/auth/signout";
              }}
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Панель администратора
            </h1>
            <p className="text-gray-600">
              Управляйте рецептами и содержимым сайта
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/admin/recipes/new">
              <div className="glass rounded-xl p-6 hover:bg-white/40 transition-all transform hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Plus className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Новый рецепт
                </h3>
                <p className="text-gray-600 text-sm">
                  Создать новый рецепт с пошаговыми инструкциями
                </p>
              </div>
            </Link>

            <Link href="/admin/recipes">
              <div className="glass rounded-xl p-6 hover:bg-white/40 transition-all transform hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Все рецепты
                </h3>
                <p className="text-gray-600 text-sm">
                  Просмотр и редактирование существующих рецептов
                </p>
              </div>
            </Link>

            <Link href="/admin/categories">
              <div className="glass rounded-xl p-6 hover:bg-white/40 transition-all transform hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Settings className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Категории
                </h3>
                <p className="text-gray-600 text-sm">
                  Управление категориями рецептов
                </p>
              </div>
            </Link>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Статистика
              </h3>
              <p className="text-gray-600 text-sm">
                Аналитика и статистика сайта
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Последние действия
            </h2>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Последние действия будут отображаться здесь
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (status === "unauthenticated") {
    return null; // useEffect уже перенаправит
  }

  // Если пользователь не администратор
  if (session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-xl p-8 text-center">
          <ChefHat className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Доступ запрещен
          </h2>
          <p className="text-gray-600 mb-6">
            У вас нет прав для доступа к админ-панели. Только администраторы
            могут получить доступ к этой странице.
          </p>
          <Link href="/">
            <Button className="glass hover:bg-white/40 text-gray-800 font-semibold">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
