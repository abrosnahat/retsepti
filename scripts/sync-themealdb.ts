/**
 * Daily sync from TheMealDB.
 *
 * What it does:
 *  1. Lists ALL meals on TheMealDB by enumerating every category.
 *  2. Compares with already-imported meals (DB slugs + on-disk known list).
 *  3. For each NEW id, fetches the meal (using disk cache when possible),
 *     translates EN→KA via Ollama (using persistent translation cache),
 *     and inserts as a draft (published=false).
 *  4. Writes the new known-id list and timestamp to disk.
 *
 * Designed to be safe to run repeatedly. Will be a no-op when nothing is new.
 *
 * Usage (manual):
 *   npm run sync:themealdb
 *
 * Daily on macOS (launchd) — see scripts/themealdb/com.retsepti.themealdb-sync.plist
 * Daily on Linux (cron):
 *   0 4 * * *  cd /path/to/retsepti && /usr/local/bin/npm run sync:themealdb >> .cache/themealdb/sync.log 2>&1
 */

import { PrismaClient } from "@prisma/client";
import {
  fetchAllMealIds,
  fetchMealById,
  getKnownRecipeMealIds,
  importMeal,
  OllamaTranslator,
  readSyncState,
  saveTranslationsNow,
  writeSyncState,
} from "./themealdb/lib";

const args = process.argv.slice(2).reduce<Record<string, string>>((acc, a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) acc[m[1]] = m[2] ?? "true";
  return acc;
}, {});

const SKIP_TRANSLATE = args["no-translate"] === "true";
const MAX_NEW = args.max ? parseInt(args.max, 10) : Infinity;
const DRY_RUN = args["dry-run"] === "true";

const prisma = new PrismaClient();

async function main() {
  const startedAt = new Date();
  const translator = new OllamaTranslator({
    url: args["ollama-url"],
    model: args.model,
    enabled: !SKIP_TRANSLATE,
  });

  console.log(`🔄 TheMealDB daily sync — ${startedAt.toISOString()}`);
  console.log(
    `   translate=${!SKIP_TRANSLATE} model=${translator.model} dry-run=${DRY_RUN}`
  );

  if (translator.enabled) {
    try {
      await translator.check();
      console.log(`   ✓ Ollama OK (${translator.url}, ${translator.model})`);
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

  // 1. Build the set of remote IDs and the set we already have.
  console.log("   Fetching full meal list from TheMealDB…");
  const remoteIds = await fetchAllMealIds();
  console.log(`   Remote total: ${remoteIds.length}`);

  const dbIds = await getKnownRecipeMealIds(prisma);
  const state = await readSyncState();
  const known = new Set<string>([...dbIds, ...state.knownIds]);
  console.log(`   Already in DB: ${dbIds.size}, known cache: ${state.knownIds.length}`);

  const newIds = remoteIds.filter((id) => !known.has(id));
  console.log(`   New ids: ${newIds.length}`);

  if (DRY_RUN) {
    console.log(`   (dry-run) would import: ${newIds.slice(0, 20).join(", ")}${newIds.length > 20 ? "…" : ""}`);
    return;
  }

  let imported = 0;
  let failed = 0;
  const limit = Math.min(newIds.length, MAX_NEW);
  for (let i = 0; i < limit; i++) {
    const id = newIds[i];
    try {
      const meal = await fetchMealById(id);
      if (!meal) {
        failed++;
        continue;
      }
      console.log(`   • [${i + 1}/${limit}] ${meal.strMeal} (${meal.strCategory ?? "?"})`);
      const result = await importMeal(
        { prisma, translator, authorId: admin.id },
        meal
      );
      if (result === "imported") imported++;
    } catch (err) {
      console.error(`   ✗ id=${id}:`, (err as Error).message);
      failed++;
    }
  }

  await saveTranslationsNow();
  await writeSyncState({
    lastSyncAt: startedAt.toISOString(),
    knownIds: remoteIds,
  });

  const finishedAt = new Date();
  const elapsed = ((finishedAt.getTime() - startedAt.getTime()) / 1000).toFixed(1);
  console.log(
    `✅ Sync complete. imported=${imported} failed=${failed} elapsed=${elapsed}s`
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
