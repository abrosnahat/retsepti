import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Проверяет, является ли текущий пользователь администратором
 * @returns true если пользователь - администратор, false в противном случае
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session && session.user?.role === "admin";
}

/**
 * Проверяет авторизацию администратора и возвращает ошибку если не авторизован
 * @returns null если авторизован, NextResponse с ошибкой если нет
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Требуется авторизация" },
      { status: 401 }
    );
  }

  if (session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Доступ запрещен. Требуются права администратора" },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Получает текущую сессию
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}
