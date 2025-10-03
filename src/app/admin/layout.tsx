"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (status === "unauthenticated") {
    return null; // useEffect уже перенаправит
  }

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

  return <>{children}</>;
}
