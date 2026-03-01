import React from "react";
import ProductList from "./_components/ProductList";
import ProductFilter from "./_components/ProductFilter";

import { getMessages } from "next-intl/server";

import { Suspense } from "react";
import Loading from "../loading";
import { Metadata } from "next";
import getTrans from "@/lib/translation";

import { Locale } from "@/i18n.config";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary: any = await getMessages({ locale });

  return {
    title: dictionary.metadata.products.title,
    description: dictionary.metadata.products.description,
  };
}

// ... (existing imports)

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);

  return (
    <div className="container mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      {/* SearchParamsHandler removed as we moved to URL-based state management */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        {t.products.title}
      </h1>

      <Suspense fallback={<Loading />}>
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Sidebar with filters - collapses on mobile */}
          <div className="w-full lg:w-1/4 mb-4 lg:mb-0 lg:sticky lg:top-24 lg:h-fit">
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
