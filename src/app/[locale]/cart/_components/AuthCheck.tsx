// src/app/[locale]/cart/_components/AuthCheck.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "@/components/link";
import { Routes } from "@/constants/enums";
import { Loader2, ShoppingBag, LogIn } from "lucide-react";
import { useMergeGuestCart } from "@/hooks/useCart";
import CartItems, { CartItemsProps } from "./CartItems";

interface AuthCheckProps {
  translations: CartItemsProps["translations"];
  locale: string;
}

export default function AuthCheck({ translations, locale }: AuthCheckProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const mergeGuestCart = useMergeGuestCart();
  const isRTL = locale === "ar";

  useEffect(() => {
    const checkAuthAndMergeCart = async () => {
      try {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        // If logged in, check for guest cart and merge
        if (token) {
          const guestCartStr = localStorage.getItem("guestCart");
          if (guestCartStr) {
            try {
              const guestCart = JSON.parse(guestCartStr);
              if (Array.isArray(guestCart) && guestCart.length > 0) {
                await mergeGuestCart.mutateAsync(guestCart);
              }
            } catch (e) {
              console.error("Error parsing guest cart:", e);
              localStorage.removeItem("guestCart");
            }
          }
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndMergeCart();
  }, []);

  // Loading state
  if (isCheckingAuth || isLoggedIn === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <p className="text-gray-500">
          {isRTL ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px] gap-8 text-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            {isRTL
              ? "يرجى تسجيل الدخول لعرض سلة التسوق"
              : "Please login to view your cart"}
          </h2>
          <p className="text-gray-500 max-w-md">
            {isRTL
              ? "يجب عليك تسجيل الدخول أولاً لعرض منتجات سلة التسوق الخاصة بك وإتمام عملية الشراء"
              : "You need to login first to view your cart items and complete your purchase"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${locale}/${Routes.LOGIN}`}
            className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogIn className="h-5 w-5" />
            {isRTL ? "تسجيل الدخول" : "Login"}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="border-2 border-black text-black px-8 py-3 font-semibold hover:bg-black hover:text-white transition-all duration-300"
          >
            {translations.cart.startShopping}
          </Link>
        </div>

        {/* Guest Cart Info */}
        <GuestCartInfo locale={locale} />
      </div>
    );
  }

  // Logged in - show cart
  return <CartItems translations={translations} locale={locale} />;
}

// Guest Cart Info Component
function GuestCartInfo({ locale }: { locale: string }) {
  const [guestItemsCount, setGuestItemsCount] = useState(0);
  const isRTL = locale === "ar";

  useEffect(() => {
    const guestCartStr = localStorage.getItem("guestCart");
    if (guestCartStr) {
      try {
        const guestCart = JSON.parse(guestCartStr);
        if (Array.isArray(guestCart)) {
          const count = guestCart.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          );
          setGuestItemsCount(count);
        }
      } catch {
        setGuestItemsCount(0);
      }
    }
  }, []);

  if (guestItemsCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
      <p className="text-blue-800 text-sm">
        {isRTL
          ? `لديك ${guestItemsCount} منتج في سلة الضيف. سجل الدخول لحفظها!`
          : `You have ${guestItemsCount} item(s) in your guest cart. Login to save them!`}
      </p>
    </div>
  );
}
