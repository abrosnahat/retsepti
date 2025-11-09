"use client";

import Link from "next/link";
import { ChefHat, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass mt-auto border-t border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О сайте */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-rose-600" />
              <span className="text-xl font-bold text-gray-800">Рецепты</span>
            </Link>
            <p className="text-sm text-gray-600">
              Коллекция лучших кулинарных рецептов со всего мира. Готовьте с
              удовольствием!
            </p>
          </div>

          {/* Навигация */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  Все рецепты
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  Категории
                </Link>
              </li>
            </ul>
          </div>

          {/* Категории */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">
              Популярные категории
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories/zavtraki"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  Завтраки
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/obedy"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  Обеды
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/deserty"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  Десерты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Контакты</h3>
            <div className="space-y-3">
              <a
                href="mailto:info@recipes.com"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-rose-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@retsepti.ge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} Рецепты. Все права защищены.
            </p>
            <p className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Сделано с</span>
              <Heart className="h-4 w-4 text-rose-600 fill-rose-600" />
              <span>для любителей готовить</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
