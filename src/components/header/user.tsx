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
import { useAuth } from "@/providers";
import { useClearCart } from "@/hooks/useCart";
import { useClearWishlist } from "@/hooks/useWishlist";
import { UserRole, Routes } from "@/constants/enums";
import Image from "next/image";

export default function User({
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const { user, logout } = useAuth();
  const clearCartMutation = useClearCart();
  const clearWishlistMutation = useClearWishlist();
  const { locale } = useParams();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    clearCartMutation.mutate();
    clearWishlistMutation.mutate();
    router.push(`/${locale}`);
  };

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
                  src={user?.avatar ? `${user?.avatar}` : "/user.jpg"}
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
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/auth/signin`)}
            >
              {t.login}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/auth/signup`)}
            >
              {t.register}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
