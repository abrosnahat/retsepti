import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Создаем базовые категории
  const categories = [
    { name: "Супы", slug: "supy" },
    { name: "Вторые блюда", slug: "vtorye-blyuda" },
    { name: "Салаты", slug: "salaty" },
    { name: "Закуски", slug: "zakuski" },
    { name: "Десерты", slug: "deserti" },
    { name: "Выпечка", slug: "vypechka" },
    { name: "Напитки", slug: "napitki" },
    { name: "Соусы", slug: "sousy" },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
  }

  console.log("Базовые категории созданы");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
