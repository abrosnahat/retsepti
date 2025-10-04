"use client";

import { useRouter } from "next/navigation";

interface CategoryLinkProps {
  categorySlug: string;
  categoryName: string;
}

export function CategoryLink({
  categorySlug,
  categoryName,
}: CategoryLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/categories/${categorySlug}`);
  };

  return (
    <button
      onClick={handleClick}
      className="hover:text-rose-600 transition-colors text-left"
    >
      {categoryName}
    </button>
  );
}
