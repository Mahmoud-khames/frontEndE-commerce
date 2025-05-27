import Link from "@/components/link";

import React from "react";
import CheckoutForm from "./_components/CheckoutForm";
import Payment from "./_components/Payment";
import { getDictionary } from "@/lib/dictionary";

import { Metadata } from "next";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);
  
  
  return {
    title: dictionary.metadata.checkout.title,
    description: dictionary.metadata.checkout.description,
  };
}


export default async function CheckoutPage() {
  const locale = await getCurrentLocale();
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
