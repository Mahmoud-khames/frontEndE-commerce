// src/app/[locale]/checkout/page.tsx
import Link from "@/components/link";
import React from "react";
import CheckoutForm from "./_components/CheckoutForm";
import OrderSummary from "./_components/OrderSummary";
import { Metadata } from "next";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTrans(locale);

  return {
    title: t.metadata?.checkout?.title || "Checkout",
    description: t.metadata?.checkout?.description || "Complete your order",
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);
  const isRTL = locale === "ar";

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
          {t.navigation?.home || "Home"}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/cart`} className="hover:text-foreground transition-colors">
          {t.navigation?.cart || "Cart"}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {t.navigation?.checkout || "Checkout"}
        </span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">
        {t.checkout?.title || "Checkout"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form - 2 columns */}
        <div className="lg:col-span-2">
          <CheckoutForm t={t} locale={locale} />
        </div>

        {/* Order Summary - 1 column */}
        <div className="lg:col-span-1">
          <OrderSummary t={t} locale={locale} />
        </div>
      </div>
    </div>
  );
}