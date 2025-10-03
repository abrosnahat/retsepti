const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    const categories = [
      { name: "Завтраки", slug: "zavtraki" },
      { name: "Основные блюда", slug: "osnovnye-blyuda" },
      { name: "Десерты", slug: "deserty" },
      { name: "Супы", slug: "supy" },
      { name: "Салаты", slug: "salaty" },
      { name: "Напитки", slug: "napitki" },
      { name: "Выпечка", slug: "vypechka" },
      { name: "Закуски", slug: "zakuski" },
    ];

    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: category,
        });
        console.log(`✅ Создана категория: ${category.name}`);
      } else {
        console.log(`⚠️ Категория уже существует: ${category.name}`);
      }
    }

    console.log("\n🎉 Создание категорий завершено!");
  } catch (error) {
    console.error("❌ Ошибка при создании категорий:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
