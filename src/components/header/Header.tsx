/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "@/components/link";
import { Menu, X } from "lucide-react";

import Search from "./Search";
import LoveProdects from "./LoveProdects";
import ShoppingCartProduct from "./ShoppingCart ";
import { navBar } from "../../data/data";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./language-switcher";
import User from "./user";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/user/userSlice";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { Pages } from "@/constants/enums";

export default function Header({ t }: any) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { locale } = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAppSelector((state) => state.user);

  // Add a function to handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 z-50 w-full bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between py-3 md:py-5">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex-shrink-0">
          <h1 className="text-Text-foreground font-bold text-xl md:text-2xl">{t.logo}</h1>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-4 lg:gap-8 text-black">
          {navBar.map((item) => (
            <li key={item.id} className="capitalize">
              <Link
                href={`/${locale}/${item.url}`}
                className={cn(
                  "text-Text-foreground text-lg p-2 hover:border-b-2 ",
                  pathname === `/${locale}/${item.url}`
                    ? "border-b-2 border-black"
                    : ""
                )}
              >
                {user && item.title === Pages.REGISTER ? null : t[item.title]}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <div className="hidden md:block w-auto max-w-[200px] lg:max-w-none">
            <Search search={t.search} />
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <LoveProdects />
            <ShoppingCartProduct />
            {user && <User t={t} onLogout={handleLogout} />}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Icon */}
          <div
            className="block md:hidden cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu />
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          className={`
           fixed top-0 left-0 w-full h-screen bg-white z-50 p-4 transition-all duration-300 ease-in-out
    ${
      isMobileMenuOpen
        ? "opacity-100 translate-y-0"
        : "opacity-0 -translate-y-full pointer-events-none"
    }
  `}
        >
          <div className="flex justify-between items-start mb-6 w-full">
            <h1 className="text-2xl font-bold">Exclusive</h1>
            <X
              className="cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <ul className="flex flex-col items-center justify-center gap-6">
            {navBar.map((item) => (
              <li key={item.id} className="capitalize">
                {user && item.title === Pages.REGISTER ? null : (
                  <Link
                    href={`/${locale}/${item.url}`}
                    className={cn(
                      "text-Text-foreground text-lg hover:border-b-2",
                      pathname === `/${locale}/${item.url}`
                        ? "border-b-2 border-black"
                        : ""
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t[item.title]}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
