import Link from "@/components/link";

import React from "react";
import CheckoutForm from "./_components/CheckoutForm";
import Payment from "./_components/Payment";
import { getDictionary } from "@/lib/dictionary";

import { Metadata } from "next";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  
  const dictionary = await getDictionary(params.locale);
  
  
  return {
    title: dictionary.metadata.checkout.title,
    description: dictionary.metadata.checkout.description,
  };
}


export default async function CheckoutPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-start items-start py-10 text-gray-600 gap-4">
        <Link href="/" className="text-gray-600">
          {t.navigation.home}
        </Link>
        /
        <Link href="/cart" className="text-black">
          {t.navigation.cart}
        </Link>
        /
        <Link href="/checkout" className="text-black">
          {t.navigation.checkout}
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">{t.checkout.title}</h1>
      
      <div className="flex flex-col md:flex-row items-start justify-between w-full gap-10">
        <CheckoutForm t={t} locale={locale} />
        <Payment trans={t} locale={locale} />
      </div>
    </div>
  );
}
