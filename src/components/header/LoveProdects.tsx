"use client";

import { Heart } from "lucide-react";
import Link from "../link";
import { useWishlist } from "@/hooks";
import { useMemo } from "react";
import { useParams } from "next/navigation";

export default function LoveProdects() {
  const { locale } = useParams();
  const { data } = useWishlist();
    const wishlist = data?.data;
  console.log("data",data);

  // Calculate wishlist count
  const wishlistCount = useMemo(() => {
    if (!wishlist) return 0;
    return wishlist.count || 0;
  }, [wishlist]);

  return (
    <Link href={`/${locale}/wishlist`} className="flex items-center justify-center relative cursor-pointer">
      <div className="absolute h-3.5 w-3.5 sm:h-4 sm:w-4 bg-secondary text-white rounded-full -top-1 -right-1 flex items-center justify-center text-[10px]">
        {wishlistCount}
      </div>
      <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
    </Link>
  );
}
