import React from "react";
import Link from "@/components/link";
import Trans from "@/components/trans";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import AuthCheck from "./_components/AuthCheck";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dictionary = await getDictionary(params.locale);

  return {
    title: dictionary.metadata.cart.title,
    description: dictionary.metadata.cart.description,
  };
}

export default async function CartPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const {t} = await getTrans(locale);
  const { navigation, cart, common } = t;

  return (
    <div>
      <div className="flex justify-start items-start py-10 text-gray-600 gap-4">
        <Link href={`/${locale}`} className="text-gray-600">
          {navigation.home}
        </Link>
        /
        <Link href={`/${locale}/cart`} className="text-black">
          {navigation.cart}
        </Link>
      </div>
      <div className="flex flex-col gap-4 mb-10">
        <AuthCheck translations={{ cart, common }} locale={locale} />
      </div>
    </div>
  );
}
