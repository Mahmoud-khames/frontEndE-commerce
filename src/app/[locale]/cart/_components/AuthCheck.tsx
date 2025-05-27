"use client";

import { useEffect, useState } from "react";
import CartItems from "./CartItems";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES_MANIFEST } from "next/dist/shared/lib/constants";
import { Routes } from "@/constants/enums";

export default function AuthCheck({ translations, locale }: { translations: any; locale: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const isRTL = locale === "ar";

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not logged in, show login message
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6" dir={isRTL ? "rtl" : "ltr"}>
        <h2 className="text-2xl font-semibold">
          {isRTL ? "يرجى تسجيل الدخول لعرض سلة التسوق" : "Please login to view your cart"}
        </h2>
        <p className="text-muted-foreground">
          {isRTL ? "يجب عليك تسجيل الدخول أولاً لعرض منتجات سلة التسوق الخاصة بك" : "You need to login first to view your cart items"}
        </p>
        <div className="flex gap-4">
          <Link
            href={`/${locale}/${Routes.LOGIN}`}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all duration-300"
          >
            {isRTL ? "تسجيل الدخول" : "Login"}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="border-2 border-black text-black px-8 py-3 hover:bg-black hover:text-white transition-all duration-300"
          >
            {translations.cart.startShopping}
          </Link>
        </div>
      </div>
    );
  }

  // If logged in, show cart items
  return <CartItems translations={translations} locale={locale} />;
}