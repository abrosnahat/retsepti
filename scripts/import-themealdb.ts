/**
 * Manual import from TheMealDB (random / by category / by letter).
 * Translates EN→KA via local Ollama. Uses persistent disk caches.
 *
 * Usage:
 *   npx tsx scripts/import-themealdb.ts --count=10
 *   npx tsx scripts/import-themealdb.ts --category=Beef --count=5
 *   npx tsx scripts/import-themealdb.ts --letter=a
 *   npx tsx scripts/import-themealdb.ts --no-translate --count=5
 *   npx tsx scripts/import-themealdb.ts --model=gemma3:12b --count=5
 *
 * All recipes are saved as drafts (published=false).
 */

import { PrismaClient } from "@prisma/client";
import {
  fetchByLetter,
  fetchIdsByCategory,
  fetchMealById,
  fetchRandomMeal,
  importMeal,
  OllamaTranslator,
  saveTranslationsNow,
} from "./themealdb/lib";

const args = process.argv.slice(2).reduce<Record<string, string>>((acc, a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) acc[m[1]] = m[2] ?? "true";
  return acc;
}, {});

const COUNT = parseInt(args.count || "5", 10);
const CATEGORY = args.category;
const LETTER = args.letter;
const SKIP_TRANSLATE = args["no-translate"] === "true";

const prisma = new PrismaClient();

async function main() {
  const translator = new OllamaTranslator({
    url: args["ollama-url"],
    model: args.model,
    enabled: !SKIP_TRANSLATE,
  });

  console.log("🍳 TheMealDB → Georgian import");
  console.log(
    `  count=${COUNT} category=${CATEGORY ?? "-"} letter=${
      LETTER ?? "-"
    } translate=${!SKIP_TRANSLATE} model=${translator.model}`
  );

  if (translator.enabled) {
    try {
      await translator.check();
      console.log(`  ✓ Ollama OK at ${translator.url}, model=${translator.model}`);
    } catch (err) {
      console.error(`❌ ${(err as Error).message}`);
      process.exit(1);
    }
  }

  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
    console.error("❌ No admin user found. Run `npm run create-admin` first.");
    process.exit(1);
  }

  // Collect target meals
  const meals = [];
  if (CATEGORY) {
    const ids = (await fetchIdsByCategory(CATEGORY)).slice(0, COUNT);
    for (const id of ids) {
      const m = await fetchMealById(id);
      if (m) meals.push(m);
    }
  } else if (LETTER) {
    const arr = await fetchByLetter(LETTER);
    meals.push(...arr.slice(0, COUNT));
  } else {
    const seen = new Set<string>();
    let attempts = 0;
    while (meals.length < COUNT && attempts < COUNT * 4) {
      attempts++;
      const m = await fetchRandomMeal();
      if (m && !seen.has(m.idMeal)) {
        seen.add(m.idMeal);
        meals.push(m);
      }
    }
  }
  console.log(`  Fetched ${meals.length} meals.`);

  let imported = 0;
  let skipped = 0;
  for (const meal of meals) {
    try {
      console.log(`  • ${meal.strMeal} (${meal.strCategory ?? "?"})`);
      const result = await importMeal(
        { prisma, translator, authorId: admin.id },
        meal
      );
      if (result === "imported") imported++;
      else {
        console.log(`    ↷ skip (exists)`);
        skipped++;
      }
    } catch (err) {
      console.error(`  ✗ failed: ${meal.strMeal}`, err);
      skipped++;
    }
  }

  await saveTranslationsNow();
  console.log(`\n✅ Done. Imported: ${imported}, skipped: ${skipped}.`);
  console.log(
    "   All recipes saved as DRAFTS (published=false). Edit and publish from /admin."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await saveTranslationsNow();
    await prisma.$disconnect();
  });
