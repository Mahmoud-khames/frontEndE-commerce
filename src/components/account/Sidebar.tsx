"use client"

import Link from "@/components/link";
import { Routes } from "@/constants/enums";
import { usePathname } from "next/navigation";

export default function Sidebar({ t, locale }: { t: any; locale: string }) {
  const navItems = [
    { title: t.account.myProfile, href: Routes.PROFILE },
    { title: t.account.myOrders, href: Routes.ORDERS },
    { title: t.account.myWishlist, href: Routes.WISHLIST },
  ];
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-1/4">
      <h3 className="text-lg font-bold uppercase mb-6">Manage My Account</h3>
      <ul className="space-y-4">
        {navItems.map((item) => (
          <li key={item.title}>
            <Link
              href={`/${locale}/${item.href}`}
              className={`block text-sm ${
                pathname === `/${locale}/${item.href}`
                  ? "text-secondary font-semibold"
                  : "text-black hover:text-red-600"
              }`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
