/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { UserRole, Routes } from "@/constants/enums";
import { logout } from "@/redux/features/user/userSlice";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { clearWishlist } from "@/redux/features/wishList/wishlistSlice";
import { useAppDispatch } from "@/redux/hooks";
import Image from "next/image";

interface UserProps {
  t: any;
  onLogout?: () => void;
}

export default function User({ t }: any) {
  const dispatch = useAppDispatch();
  const { locale } = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart()); // Clear the cart when logging out
    dispatch(clearWishlist()); // Clear the wishlist when logging out
    router.push(`/${locale}`);
  };
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="bg-secondary rounded-full text-white w-6 h-6 md:w-8 md:h-8 flex items-center justify-center cursor-pointer"
          aria-label="User menu"
        >
          {user ? (
            <span className="text-sm font-medium">
              {
                <Image
                  src={
                    user?.userImage ? `${apiURL}${user?.userImage}` : "/user.jpg"
                  }
                  alt={user.firstName}
                  width={50}
                  height={50}
                  className="rounded-full w-6 h-6 md:w-8 md:h-8 object-cover"
                />
              }
            </span>
          ) : (
            <User2 className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {user ? (
          <>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/profile`)}>
              {t.profile}
            </DropdownMenuItem>

            {user?.role === UserRole.ADMIN && (
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/${locale}/${Routes.ADMIN}/${Routes.DASHBOARD}`)
                }
              >
                {t.dashboard}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              {t.logout}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/login`)}>
              {t.login}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/register`)}
            >
              {t.register}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
