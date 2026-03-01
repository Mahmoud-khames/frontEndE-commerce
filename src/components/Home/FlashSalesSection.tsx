// components/Home/FlashSalesSection.tsx
"use client";

import { useDiscountedProducts } from "@/hooks/useProducts";
import Title from "@/components/Title";
import DiscountTimer from "./DiscountTimer";
import ProductListSales from "./productListSales/ProductListSales";

interface FlashSalesSectionProps {
  t: any;
  locale: string;
}

export default function FlashSalesSection({
  t,
  locale,
}: FlashSalesSectionProps) {
  const { data: response, isLoading } = useDiscountedProducts();
  const products = response?.data || [];
  const hasDiscounts = products.length > 0;

  // Don't render if no discounted products and not loading
  if (!hasDiscounts && !isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 items-start mt-20 md:mt-40">
      <div className="flex flex-col md:flex-row gap-4 md:gap-20 w-full mb-6 md:mb-10">
        <Title title={t.home.todays} text={t.home.flashSales} />
        <div className="flex justify-end flex-col">
          <DiscountTimer />
        </div>
      </div>
      <ProductListSales t={t} locale={locale} />
    </div>
  );
}