"use client";

import Link from "next/link";
import { ChefHat, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass mt-auto border-t border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-rose-600" />
              <span className="text-xl font-bold text-gray-800">რეცეპტები</span>
            </Link>
            <p className="text-sm text-gray-600">
              მსოფლიოს საუკეთესო კულინარიული რეცეპტების კოლექცია. მოამზადეთ
              სიამოვნებით!
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">ნავიგაცია</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  მთავარი
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  ყველა რეცეპტი
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  კატეგორიები
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">
              პოპულარული კატეგორიები
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories/zavtraki"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  საუზმეები
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/obedy"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  სადილები
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/deserty"
                  className="text-sm text-gray-600 hover:text-rose-600 transition-colors"
                >
                  დესერტები
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">კონტაქტები</h3>
            <div className="space-y-3">
              <a
                href="mailto:info@recipes.com"
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-rose-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@retsepti.ge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} რეცეპტები. ყველა უფლება დაცულია.
            </p>
            <p className="flex items-center space-x-1 text-sm text-gray-600">
              <span>გაკეთებულია</span>
              <Heart className="h-4 w-4 text-rose-600 fill-rose-600" />
              <span>მზარეულობის მოყვარულთათვის</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
