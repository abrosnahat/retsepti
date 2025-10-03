import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Рецепт не найден" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe for edit:", error);
    return NextResponse.json(
      { error: "Ошибка при получении рецепта" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
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
    } = body;

    // Проверяем существование рецепта
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Рецепт не найден" }, { status: 404 });
    }

    // Проверяем уникальность slug (исключая текущий рецепт)
    const recipeWithSlug = await prisma.recipe.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (recipeWithSlug) {
      return NextResponse.json(
        { error: "Рецепт с таким URL уже существует" },
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

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        content,
        mainImage: mainImage?.trim() || null,
        prepTime,
        cookTime,
        servings,
        difficulty: difficulty || null,
        categoryId,
        published,
        featured,
        updatedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении рецепта" },
      { status: 500 }
    );
  }
}
