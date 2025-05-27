"use client";

import { ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCartItems, fetchCartItems } from "@/redux/features/cart/cartSlice";
import Link from "../link";
import { useParams } from "next/navigation";
import { getCartQuantity } from "@/lib/cart";
export default function ShoppingCartProduct() {
  const cartItems = useAppSelector(selectCartItems);
  const { user } = useAppSelector((state) => state.user);
  const { locale } = useParams();
  const dispatch = useAppDispatch();
  const [cartCount, setCartCount] = useState(0);
  
  // Use effect to update cart count whenever cartItems changes
  useEffect(() => {
    // Get the total quantity of items in the cart
    const newCount = getCartQuantity(cartItems);
    setCartCount(newCount);
  }, [cartItems]);
  
  // Fetch cart items when component mounts or user changes
  useEffect(() => {
    // If user is logged in, fetch their cart from the server
    if (user) {
      dispatch(fetchCartItems());
    }
  }, [user, dispatch]);

  return (
    <Link
      href={`/${locale}/cart`}
      className="flex items-center justify-center relative cursor-pointer"
    >
      <div className="absolute h-3.5 w-3.5 sm:h-4 sm:w-4 bg-secondary text-white rounded-full -top-1 -right-1 flex items-center justify-center text-[10px]">
        {cartCount}
      </div>
      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
    </Link>
  );
}
