"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Languages } from "@/constants/enums";

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams();

  const switchLanguage = (newLocale: string) => {
    const path =
      pathname?.replace(`/${locale}`, `/${newLocale}`) ?? `/${newLocale}`;
    router.push(path);
  };

  return (
    <div className="flex">
      <Button
        variant="outline"
        onClick={() => switchLanguage(locale === Languages.ARABIC ? Languages.ENGLISH : Languages.ARABIC)}
        className="cursor-pointer hover:bg-secondary hover:text-white text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto"
      >
        {locale === Languages.ARABIC ? "English" : "العربية"}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
