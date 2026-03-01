// app/[locale]/page.tsx
import CategoriesList from "@/components/Home/Categories/CategoriesList";
import ImgSale from "@/components/Home/ImgSale/ImgSale";
import OurProductList from "@/components/Home/ourProductList/OurProductList";
import ProductList from "@/components/Home/productList/ProductList";
import FlashSalesSection from "@/components/Home/FlashSalesSection";
import Link from "@/components/link";
import Title from "@/components/Title";
import { Suspense } from "react";
import Loading from "./loading";
import { Metadata } from "next";
import { getMessages } from "next-intl/server";
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
    title: dictionary.metadata.home.title,
    description: dictionary.metadata.home.description,
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);
  const { home } = t;

  return (
    <main className="flex flex-col gap-4">
      <Suspense fallback={<Loading />}>
        {/* Hero Section */}
        <div className="flex pt-[80px] min-h-[280px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] items-center justify-center w-full">
          <ImgSale t={t} locale={locale} />
        </div>

        {/* Flash Sales Section - Will hide if no discounted products */}
        <FlashSalesSection t={t} locale={locale} />

        {/* Categories Section */}
        <div className="flex flex-col gap-4 items-start mt-20 md:mt-40">
          <Title title={home.categories} text={home.browseByCategory} />
          <CategoriesList />
          <div className="w-full h-[1px] bg-[#E5E5E5] my-10"></div>
        </div>

        {/* Best Selling Products */}
        <div className="flex flex-col gap-4 items-start mt-20 md:mt-40">
          <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-20 w-full mb-10">
            <Title title={home.thisMonth} text={home.bestSellingProducts} />
            <div className="hidden md:flex items-end">
              <Link
                href="/products"
                className="text-white bg-secondary hover:bg-secondary/90 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center px-8 md:px-12 py-3 md:py-4 rounded text-sm md:text-base font-medium shadow-lg"
              >
                {home.viewAll}
              </Link>
            </div>
          </div>
          <ProductList t={t} locale={locale} filter={{ bestSelling: true }} />
        </div>

        {/* Our Products */}
        <div className="flex flex-col gap-4 items-start mt-20 md:mt-40 mb-20">
          <div className="flex flex-col md:flex-row gap-4 md:gap-20 w-full mb-10">
            <Title title={home.ourProducts} text={home.exploreOurProducts} />
          </div>
          <OurProductList t={t} locale={locale} />
        </div>
      </Suspense>
    </main>
  );
}
