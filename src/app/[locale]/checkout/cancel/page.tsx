// src/app/[locale]/checkout/cancel/page.tsx
import { Locale } from "@/i18n.config";
import CancelContent from "./_components/CancelContent";
import getTrans from "@/lib/translation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isRTL = locale === "ar";

  return {
    title: isRTL ? "تم إلغاء الدفع" : "Payment Cancelled",
    description: isRTL 
      ? "تم إلغاء عملية الدفع الخاصة بك" 
      : "Your payment was cancelled",
  };
}

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);

  return <CancelContent locale={locale} t={t.checkout || {}} />;
}