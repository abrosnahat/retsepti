"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChefHat } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        const session = await getSession();
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          setError("У вас нет прав администратора");
        }
      }
    } catch {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="glass rounded-xl p-8">
            <div className="text-center mb-8">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 mb-4"
              >
                <ChefHat className="h-8 w-8 text-rose-600" />
                <span className="text-2xl font-bold text-gray-800">
                  Рецепты
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Вход в админку
              </h1>
              <p className="text-gray-600">
                Введите данные для входа в панель администратора
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email адрес
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full glass hover:bg-white/40 text-gray-800 font-semibold"
              >
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-rose-600 hover:text-rose-700 transition-colors"
              >
                ← Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
