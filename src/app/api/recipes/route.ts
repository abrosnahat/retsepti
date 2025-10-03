import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        category: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Received recipe data:", body);
    console.log("Session user:", session.user);
    console.log("Session user ID:", session.user.id);
    console.log("Session user ID type:", typeof session.user.id);

    const {
      title,
      slug,
      description,
      content,
      mainImage,
      prepTime,
      cookTime,
      servings,
      difficulty,
      categoryId,
      published,
      featured,
      ingredients,
      instructions,
    } = body;

    // Валидация обязательных полей
    if (!title || !categoryId) {
      return NextResponse.json(
        { error: "Название и категория обязательны" },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      console.error("User not found by email:", session.user.email);
      console.error(
        "Available users:",
        await prisma.user.findMany({ select: { id: true, email: true } })
      );
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 400 }
      );
    }

    console.log("Creating recipe with authorId:", user.id);
    console.log("Category found:", category.name);
    console.log("User found:", user.email);

    // Создаем рецепт
    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
        description: description || null,
        content: content || "",
        mainImage: mainImage || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || null,
        difficulty: difficulty || "easy",
        categoryId,
        authorId: user.id,
        published: Boolean(published),
        featured: Boolean(featured),
        ingredients: ingredients || "[]",
        instructions: instructions || "[]",
      },
      include: {
        category: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);

    // Проверяем на уникальность slug
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Рецепт с таким URL уже существует" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
