"use client";

import { ShoppingCart } from "lucide-react";
import React, { useMemo } from "react";
import { useCart } from "@/hooks";
import Link from "../link";
import { useParams } from "next/navigation";

export default function ShoppingCartProduct() {
  const { data } = useCart();
  const cart = data?.data;

  const { locale } = useParams();

  // Calculate cart count from items
  const cartCount = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart?.items]);

  return (
    <Link
      href={`/${locale}/cart`}
      className="flex items-center justify-center relative cursor-pointer"
    >
      <div className="absolute -top-2 -right-2 h-5 w-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white z-10">
        {cartCount > 99 ? "99+" : cartCount}
      </div>
      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
    </Link>
  );
}
