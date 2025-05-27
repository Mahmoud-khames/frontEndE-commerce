"use client";

import { addItemToCart, addToCartAsync } from "@/redux/features/cart/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import { IProduct } from "@/types/type";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import getTrans from "@/lib/translation";

export default function AddToCart({ 
  product, 
  quantity = 1,
  selectedSize = null,
  selectedColor = null,
  disabled = false
}: { 
  product: IProduct;
  quantity?: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  disabled?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { locale } = useParams();
  const [translations, setTranslations] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    const fetchTranslations = async () => {
      try {
        const trans = await getTrans(locale as string);
        setTranslations(trans.t);
      } catch (error) {
        console.error("Error fetching translations:", error);
        setTranslations({ cart: { addToCart: "Add To Cart", addedToCart: "added to cart!" } });
      }
    };

    fetchTranslations();
  }, [locale]);

  const handleAddToCart = () => {
    if (disabled) {
      // إذا كان هناك مقاسات أو ألوان ولم يتم تحديد أي منها
      if (product.productSizes && product.productSizes.length > 0 && !selectedSize) {
        toast.warning(translations?.cart?.selectSize || "Please select a size");
        return;
      }
      if (product.productColors && product.productColors.length > 0 && !selectedColor) {
        toast.warning(translations?.cart?.selectColor || "Please select a color");
        return;
      }
    }

    if (isLoggedIn) {
      // Use the async thunk if logged in
      dispatch(addToCartAsync({ 
        productId: product._id, 
        quantity, 
        size: selectedSize, 
        color: selectedColor,
        price: product.productPrice,
        discount: product.productDiscountPrice ? product.productPrice - product.productDiscountPrice : 0
      }));
      
    } else {
      // Use local state if not logged in
      dispatch(addItemToCart({ product, quantity, size: selectedSize, color: selectedColor }));
      toast.success(`${product.productName} (${quantity}) ${translations?.cart?.addedToCart || "added to cart!"}`);
    }
  };

  if (!translations) {
    return (
      <div className="flex items-center justify-center w-full h-full text-center text-white">
        <button
          disabled
          className="w-full h-full text-white cursor-not-allowed rounded-xl opacity-50"
        >
          Loading...
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled}
      className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
        disabled ? "bg-gray-400 cursor-not-allowed" : "hover:bg-secondary"
      }`}
    >
      {translations?.cart?.addToCart || "Add To Cart"}
    </button>
  );
}
