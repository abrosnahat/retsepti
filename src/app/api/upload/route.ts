import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-helpers";

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const authError = await requireAdmin();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Файл должен быть изображением" },
        { status: 400 }
      );
    }

    // Проверка размера файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер 10MB" },
        { status: 400 }
      );
    }

    // Конвертация файла в base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Загрузка в Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "recipes", // Папка в Cloudinary
      resource_type: "image",
      transformation: [
        { width: 1200, height: 800, crop: "limit" }, // Ограничение размера
        { quality: "auto" }, // Автоматическая оптимизация качества
        { fetch_format: "auto" }, // Автоматический формат (WebP где поддерживается)
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить изображение" },
      { status: 500 }
    );
  }
}

// Удаление изображения из Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID не предоставлен" },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления изображения:", error);
    return NextResponse.json(
      { error: "Не удалось удалить изображение" },
      { status: 500 }
    );
  }
}
