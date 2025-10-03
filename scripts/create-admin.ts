#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log("🧑‍🍳 Создание администратора для сайта рецептов");
    console.log("=".repeat(50));

    // Проверяем, есть ли уже администраторы
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("❌ Администратор уже существует в системе:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Имя: ${existingAdmin.name}`);
      return;
    }

    // Запрашиваем данные администратора
    const name = await question("👤 Введите имя администратора: ");
    if (!name.trim()) {
      console.log("❌ Имя не может быть пустым");
      return;
    }

    const email = await question("📧 Введите email администратора: ");
    if (!email.includes("@")) {
      console.log("❌ Введите корректный email адрес");
      return;
    }

    const password = await question("🔒 Введите пароль (минимум 6 символов): ");
    if (password.length < 6) {
      console.log("❌ Пароль должен содержать минимум 6 символов");
      return;
    }

    // Хешируем пароль
    console.log("🔐 Хеширование пароля...");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем администратора
    console.log("👨‍💼 Создание администратора...");
    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Администратор успешно создан!");
    console.log("=".repeat(50));
    console.log(`👤 Имя: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log("=".repeat(50));
    console.log("🚀 Теперь вы можете войти в админ-панель:");
    console.log("   URL: http://localhost:3000/login");
    console.log(`   Email: ${admin.email}`);
    console.log("   Пароль: [введенный пароль]");
  } catch (error) {
    console.error("❌ Ошибка при создании администратора:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.log("💡 Администратор с таким email уже существует");
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
