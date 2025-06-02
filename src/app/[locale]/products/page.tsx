

import React from "react";
import ProductList from "./_components/ProductList";
import ProductFilter from "./_components/ProductFilter";
import SearchParamsHandler from "./_components/SearchParamsHandler";
import { getDictionary } from "@/lib/dictionary";

import { Suspense } from "react";
import Loading from "../loading";
import { Metadata } from "next";
import getTrans from "@/lib/translation";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);
  
  
  return {
    title: dictionary.metadata.products.title,
    description: dictionary.metadata.products.description,
  };
}


// ... (existing imports)

export default async function ProductsPage() {
  const locale = await getCurrentLocale();
  const { t } = await getTrans(locale);

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
      <SearchParamsHandler />
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t.products.title}</h1>
      
      <Suspense fallback={<Loading />}>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar with filters - collapses on mobile */}
          <div className="w-full lg:w-1/4 mb-4 lg:mb-0 lg:sticky lg:top-20 lg:h-fit">
            <ProductFilter t={t} locale={locale} />
          </div>
          
          {/* Main content with product list */}
          <div className="w-full lg:w-3/4">
            <ProductList t={t} locale={locale} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
