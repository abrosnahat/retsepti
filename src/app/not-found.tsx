import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="glass rounded-xl p-12">
          <ChefHat className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Рецепт не найден
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            К сожалению, запрашиваемый рецепт не существует или был удален.
          </p>
          <Link
            href="/"
            className="inline-block glass px-8 py-4 text-lg font-semibold text-gray-800 rounded-xl hover:bg-white/40 transition-all transform hover:scale-105"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
