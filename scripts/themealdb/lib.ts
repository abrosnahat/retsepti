/**
 * Shared library for TheMealDB import / daily sync.
 *
 * Provides:
 *  - Disk cache for raw meals and translations
 *  - Ollama-based EN→KA translator
 *  - Recipe upsert into the local Prisma DB
 *
 * Caches live in .cache/themealdb/ at the repo root.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";

// ---------- Types ----------
export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string | null;
  strYoutube: string | null;
  [key: string]: string | null;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface InstructionStep {
  step: number;
  description: string;
}

// ---------- Paths / Cache ----------
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CACHE_DIR = path.join(REPO_ROOT, ".cache", "themealdb");
const MEALS_DIR = path.join(CACHE_DIR, "meals");
const TRANSLATIONS_FILE = path.join(CACHE_DIR, "translations.json");
const SYNC_STATE_FILE = path.join(CACHE_DIR, "last-sync.json");

async function ensureDirs() {
  await fs.mkdir(MEALS_DIR, { recursive: true });
}

// ---------- Translation cache (persistent) ----------
let translationsLoaded = false;
const translations = new Map<string, string>();

export async function loadTranslations() {
  if (translationsLoaded) return;
  await ensureDirs();
  try {
    const raw = await fs.readFile(TRANSLATIONS_FILE, "utf8");
    const obj = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(obj)) translations.set(k, v);
  } catch {
    /* missing is fine */
  }
  translationsLoaded = true;
}

let saveTimer: NodeJS.Timeout | null = null;
function scheduleSaveTranslations() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveTranslationsNow, 1000);
}

export async function saveTranslationsNow() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const obj: Record<string, string> = {};
  for (const [k, v] of translations) obj[k] = v;
  await ensureDirs();
  await fs.writeFile(TRANSLATIONS_FILE, JSON.stringify(obj, null, 2), "utf8");
}

// ---------- Meal cache ----------
async function readMealCache(id: string): Promise<MealDBMeal | null> {
  try {
    const raw = await fs.readFile(path.join(MEALS_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as MealDBMeal;
  } catch {
    return null;
  }
}

async function writeMealCache(meal: MealDBMeal) {
  await ensureDirs();
  await fs.writeFile(
    path.join(MEALS_DIR, `${meal.idMeal}.json`),
    JSON.stringify(meal, null, 2),
    "utf8"
  );
}

// ---------- Sync state ----------
interface SyncState {
  lastSyncAt: string;
  knownIds: string[];
}

export async function readSyncState(): Promise<SyncState> {
  try {
    const raw = await fs.readFile(SYNC_STATE_FILE, "utf8");
    return JSON.parse(raw) as SyncState;
  } catch {
    return { lastSyncAt: "", knownIds: [] };
  }
}

export async function writeSyncState(state: SyncState) {
  await ensureDirs();
  await fs.writeFile(SYNC_STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

// ---------- TheMealDB API ----------
const MEALDB = "https://www.themealdb.com/api/json/v1/1";

export async function fetchMealById(
  id: string,
  opts: { useCache?: boolean } = { useCache: true }
): Promise<MealDBMeal | null> {
  if (opts.useCache !== false) {
    const cached = await readMealCache(id);
    if (cached) return cached;
  }
  const data = await fetch(`${MEALDB}/lookup.php?i=${id}`).then(
    (r) => r.json() as Promise<{ meals: MealDBMeal[] | null }>
  );
  const meal = data.meals?.[0] || null;
  if (meal) await writeMealCache(meal);
  return meal;
}

export async function fetchAllCategories(): Promise<string[]> {
  const data = await fetch(`${MEALDB}/list.php?c=list`).then(
    (r) => r.json() as Promise<{ meals: { strCategory: string }[] | null }>
  );
  return (data.meals || []).map((m) => m.strCategory);
}

export async function fetchIdsByCategory(category: string): Promise<string[]> {
  const data = await fetch(
    `${MEALDB}/filter.php?c=${encodeURIComponent(category)}`
  ).then(
    (r) => r.json() as Promise<{ meals: { idMeal: string }[] | null }>
  );
  return (data.meals || []).map((m) => m.idMeal);
}

export async function fetchAllMealIds(): Promise<string[]> {
  const cats = await fetchAllCategories();
  const all = new Set<string>();
  for (const cat of cats) {
    const ids = await fetchIdsByCategory(cat);
    ids.forEach((id) => all.add(id));
  }
  return Array.from(all);
}

export async function fetchRandomMeal(): Promise<MealDBMeal | null> {
  const r = await fetch(`${MEALDB}/random.php`).then(
    (res) => res.json() as Promise<{ meals: MealDBMeal[] | null }>
  );
  const m = r.meals?.[0] || null;
  if (m) await writeMealCache(m);
  return m;
}

export async function fetchByLetter(letter: string): Promise<MealDBMeal[]> {
  const data = await fetch(
    `${MEALDB}/search.php?f=${encodeURIComponent(letter)}`
  ).then((r) => r.json() as Promise<{ meals: MealDBMeal[] | null }>);
  const meals = data.meals || [];
  for (const m of meals) await writeMealCache(m);
  return meals;
}

// ---------- Ollama translator ----------
export interface TranslatorOptions {
  url?: string;
  model?: string;
  enabled?: boolean;
}

export class OllamaTranslator {
  url: string;
  model: string;
  enabled: boolean;

  constructor(opts: TranslatorOptions = {}) {
    this.url =
      opts.url || process.env.OLLAMA_URL || "http://localhost:11434";
    this.model = opts.model || process.env.OLLAMA_MODEL || "gemma4:e4b";
    this.enabled = opts.enabled !== false;
  }

  async check() {
    if (!this.enabled) return;
    const res = await fetch(`${this.url}/api/tags`);
    if (!res.ok) {
      throw new Error(`Cannot reach Ollama at ${this.url}: HTTP ${res.status}`);
    }
    const data = (await res.json()) as { models?: { name: string }[] };
    const names = (data.models || []).map((m) => m.name);
    const base = this.model.split(":")[0];
    const has = names.some((n) => n === this.model || n.split(":")[0] === base);
    if (!has) {
      throw new Error(
        `Model "${this.model}" not pulled. Available: ${
          names.join(", ") || "(none)"
        }. Run: ollama pull ${this.model}`
      );
    }
  }

  private async generate(prompt: string): Promise<string> {
    const res = await fetch(`${this.url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 1024 },
      }),
    });
    if (!res.ok)
      throw new Error(`Ollama HTTP ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { response?: string; error?: string };
    if (data.error) throw new Error(data.error);
    return (data.response || "").trim();
  }

  private clean(raw: string, original: string): string {
    let s = raw.trim();
    s = s.replace(/^```[a-zA-Z]*\s*/m, "").replace(/```\s*$/m, "");
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("«") && s.endsWith("»")) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    s = s
      .replace(/^(translation|here(?:'s| is)[^:]*|თარგმანი)\s*[:\-]\s*/i, "")
      .trim();
    return s.split(/\n{2,}/)[0].trim() || original;
  }

  /**
   * Validate translation output:
   *  - must contain at least one Georgian character (U+10A0..U+10FF)
   *  - must NOT contain Hangul / CJK / Hiragana / Katakana / Hebrew / Arabic / Devanagari
   *  - latin letter ratio must be small (translator must not return English)
   */
  private isValidGeorgian(out: string, original: string): boolean {
    if (!out) return false;
    const hasGeorgian = /[\u10A0-\u10FF]/.test(out);
    if (!hasGeorgian) return false;

    // Forbidden scripts (model hallucinations)
    const forbidden =
      /[\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0400-\u04FF]/;
    if (forbidden.test(out)) return false;

    // Latin letters should be a minor part. Allow units (g, ml, oz, tbsp, tsp, cup),
    // but if more than ~40% of letters are latin — translation is likely incomplete.
    const letters = out.replace(/[^A-Za-z\u10A0-\u10FF]/g, "");
    if (letters.length > 0) {
      const latin = (out.match(/[A-Za-z]/g) || []).length;
      const ratio = latin / letters.length;
      // Short inputs (likely ingredient names, units) — be stricter
      if (original.length < 40) {
        if (ratio > 0.3) return false;
      } else if (ratio > 0.4) {
        return false;
      }
    }
    return true;
  }

  async translate(text: string): Promise<string> {
    if (!this.enabled) return text;
    const trimmed = text.trim();
    if (!trimmed) return text;
    await loadTranslations();
    const cached = translations.get(trimmed);
    if (cached && this.isValidGeorgian(cached, trimmed)) return cached;
    if (cached) {
      // bad cached value — drop it
      translations.delete(trimmed);
    }

    const basePrompt = `You are a professional culinary translator. Translate the following English cooking text into Georgian (ქართული, Mkhedruli script).
Rules:
- Output ONLY the Georgian translation in Mkhedruli script. No explanations, no quotes, no English text, no other languages.
- Keep numbers and units of measurement (g, ml, oz, tbsp, tsp, cup, etc.) as-is.
- Preserve the meaning and tone. Do not add or remove information.
- If the input is a single ingredient name, output a single Georgian ingredient name.

English: ${trimmed}
Georgian:`;

    const retryPrompt = `Translate to Georgian (ქართული) using ONLY Mkhedruli script (\u10A0-\u10FF). NO Korean, NO Chinese, NO Japanese, NO English. Output translation only, nothing else.

Text: ${trimmed}
ქართული:`;

    for (const prompt of [basePrompt, retryPrompt]) {
      try {
        const raw = await this.generate(prompt);
        const out = this.clean(raw, trimmed);
        if (out && this.isValidGeorgian(out, trimmed)) {
          translations.set(trimmed, out);
          scheduleSaveTranslations();
          return out;
        }
        console.warn(
          `  ⚠ invalid translation output for "${trimmed.slice(0, 40)}…", retrying`
        );
      } catch (err) {
        console.warn(
          `  ⚠ translation error (${(err as Error).message}), retrying`
        );
      }
    }
    console.warn(
      `  ⚠ translation failed for "${trimmed.slice(0, 60)}", keeping English`
    );
    return trimmed;
  }
}

// ---------- Category mapping ----------
const CATEGORY_MAP: Record<string, { name: string; slug: string }> = {
  Beef: { name: "საქონლის ხორცი", slug: "beef" },
  Chicken: { name: "ქათამი", slug: "chicken" },
  Dessert: { name: "დესერტები", slug: "dessert" },
  Lamb: { name: "ცხვრის ხორცი", slug: "lamb" },
  Miscellaneous: { name: "სხვადასხვა", slug: "misc" },
  Pasta: { name: "მაკარონი", slug: "pasta" },
  Pork: { name: "ღორის ხორცი", slug: "pork" },
  Seafood: { name: "ზღვის პროდუქტები", slug: "seafood" },
  Side: { name: "გარნირი", slug: "side" },
  Starter: { name: "წასახემსებელი", slug: "starter" },
  Vegan: { name: "ვეგანური", slug: "vegan" },
  Vegetarian: { name: "ვეგეტარიანული", slug: "vegetarian" },
  Breakfast: { name: "საუზმე", slug: "breakfast" },
  Goat: { name: "თხის ხორცი", slug: "goat" },
};

const DEFAULT_CATEGORY = { name: "სხვადასხვა", slug: "misc" };

export async function ensureCategory(
  prisma: PrismaClient,
  mealdbCategory: string | null
) {
  const mapped =
    (mealdbCategory && CATEGORY_MAP[mealdbCategory]) || DEFAULT_CATEGORY;
  return prisma.category.upsert({
    where: { slug: mapped.slug },
    update: {},
    create: { name: mapped.name, slug: mapped.slug },
  });
}

// ---------- Helpers ----------
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildSlug(meal: MealDBMeal): string {
  return `${slugify(meal.strMeal)}-${meal.idMeal}`;
}

export function extractIngredients(meal: MealDBMeal): Ingredient[] {
  const out: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] || "").trim();
    const measure = (meal[`strMeasure${i}`] || "").trim();
    if (!name) continue;
    const amountMatch = measure.match(/^([\d./\s,]+)\s*(.*)$/);
    let amount = "";
    let unit = "";
    if (amountMatch) {
      amount = amountMatch[1].trim();
      unit = amountMatch[2].trim();
    } else {
      unit = measure;
    }
    out.push({ name, amount, unit });
  }
  return out;
}

export function parseInstructions(text: string): InstructionStep[] {
  return text
    .split(/\r?\n+|(?<=\.)\s{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, idx) => ({ step: idx + 1, description: p }));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- Importer ----------
export interface ImportContext {
  prisma: PrismaClient;
  translator: OllamaTranslator;
  authorId: string;
}

export async function importMeal(
  ctx: ImportContext,
  meal: MealDBMeal
): Promise<"imported" | "skipped"> {
  const slug = buildSlug(meal);
  const existing = await ctx.prisma.recipe.findUnique({ where: { slug } });
  if (existing) return "skipped";

  const category = await ensureCategory(ctx.prisma, meal.strCategory);

  const titleKa = await ctx.translator.translate(meal.strMeal);
  const descriptionEn = [meal.strArea, meal.strCategory]
    .filter(Boolean)
    .join(" · ");
  const descriptionKa = descriptionEn
    ? await ctx.translator.translate(`${descriptionEn} dish`)
    : null;

  const ingredientsEn = extractIngredients(meal);
  const ingredientsKa: Ingredient[] = [];
  for (const ing of ingredientsEn) {
    ingredientsKa.push({
      name: await ctx.translator.translate(ing.name),
      amount: ing.amount,
      unit: ing.unit ? await ctx.translator.translate(ing.unit) : "",
    });
  }

  const stepsEn = parseInstructions(meal.strInstructions || "");
  const stepsKa: InstructionStep[] = [];
  for (const s of stepsEn) {
    stepsKa.push({
      step: s.step,
      description: await ctx.translator.translate(s.description),
    });
  }

  const contentHtml = [
    descriptionKa ? `<p><em>${escapeHtml(descriptionKa)}</em></p>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await ctx.prisma.recipe.create({
    data: {
      title: titleKa,
      slug,
      description: descriptionKa,
      content: contentHtml,
      ingredients: JSON.stringify(ingredientsKa),
      instructions: JSON.stringify(stepsKa),
      mainImage: meal.strMealThumb,
      videoUrl: meal.strYoutube || null,
      published: false,
      featured: false,
      categoryId: category.id,
      authorId: ctx.authorId,
    },
  });
  return "imported";
}

export async function getKnownRecipeMealIds(
  prisma: PrismaClient
): Promise<Set<string>> {
  const rows = await prisma.recipe.findMany({ select: { slug: true } });
  const ids = new Set<string>();
  for (const r of rows) {
    const m = r.slug.match(/-(\d+)$/);
    if (m) ids.add(m[1]);
  }
  return ids;
}
