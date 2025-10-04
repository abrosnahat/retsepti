import Link from "next/link";
import Image from "next/image";
import { ChefHat, Clock, Users } from "lucide-react";
import { CategoryLink } from "./category-link";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mainImage: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string | null;
  author: {
    name: string | null;
  };
  category?: {
    name: string;
    slug: string;
  };
}

interface RecipeCardProps {
  recipe: Recipe;
  showCategory?: boolean;
}

export function RecipeCard({ recipe, showCategory = false }: RecipeCardProps) {
  const getDifficultyText = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "Легко";
      case "medium":
        return "Средне";
      case "hard":
        return "Сложно";
      default:
        return "Не указано";
    }
  };

  const getTotalTime = (prepTime: number | null, cookTime: number | null) => {
    const total = (prepTime || 0) + (cookTime || 0);
    return total > 0 ? `${total} мин` : "Не указано";
  };

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group">
      <div className="glass rounded-xl overflow-hidden hover:bg-white/40 transition-all transform hover:scale-105">
        {/* Recipe Image */}
        <div className="aspect-video bg-gradient-to-br from-rose-100 to-purple-100 relative overflow-hidden">
          {recipe.mainImage ? (
            <Image
              src={recipe.mainImage}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChefHat className="h-16 w-16 text-rose-300" />
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Recipe Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {(recipe.prepTime || recipe.cookTime) && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {getTotalTime(recipe.prepTime, recipe.cookTime)}
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {recipe.servings}
                </div>
              )}
            </div>
            {recipe.difficulty && (
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {getDifficultyText(recipe.difficulty)}
              </span>
            )}
          </div>

          {/* Category and Author */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            {showCategory && recipe.category && (
              <CategoryLink
                categorySlug={recipe.category.slug}
                categoryName={recipe.category.name}
              />
            )}
            {recipe.author.name && (
              <span
                className={showCategory && recipe.category ? "" : "ml-auto"}
              >
                Автор: {recipe.author.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
