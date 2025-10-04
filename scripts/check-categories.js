const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany();
    console.log("Categories found:", categories.length);
    categories.forEach((cat) => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
