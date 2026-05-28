// src/app/[locale]/admin/coupons/page.tsx
import React from "react";

import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";
import { Metadata } from "next";
import CouponItems from "./_components/couponItems";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  
  return {
    title: isArabic ? "إدارة الكوبونات" : "Coupons Management",
    description: isArabic 
      ? "إنشاء وإدارة كوبونات الخصم" 
      : "Create and manage discount coupons",
  };
}

export default async function CouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const { t } = await getTrans(locale);

  return (
    <div className="container mx-auto py-6">
      <CouponItems t={t} locale={locale} />
    </div>
  );
}
