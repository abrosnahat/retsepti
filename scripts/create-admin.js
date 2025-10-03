const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Получаем данные от пользователя
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || "Admin";

    if (!email || !password) {
      console.error(
        "Использование: node scripts/create-admin.js <email> <password> [name]"
      );
      process.exit(1);
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error("Пользователь с таким email уже существует");
      process.exit(1);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем админа
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Администратор успешно создан:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Имя: ${admin.name}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Роль: ${admin.role}`);
  } catch (error) {
    console.error("❌ Ошибка при создании администратора:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
