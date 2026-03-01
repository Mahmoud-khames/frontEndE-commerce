// src/app/[locale]/checkout/success/page.tsx
import { Suspense } from "react";
import { Locale } from "@/i18n.config";
import SuccessContent from "./_components/SuccessContent";
import getTrans from "@/lib/translation";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isRTL = locale === "ar";

  return {
    title: isRTL ? "تم الطلب بنجاح" : "Order Successful",
    description: isRTL 
      ? "شكراً لطلبك! تم تأكيد طلبك بنجاح" 
      : "Thank you for your order! Your order has been confirmed",
  };
}

function LoadingFallback() {
  return (
    <div className="container mx-auto py-16 px-4 flex justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent locale={locale} t={t.checkout || {}} />
    </Suspense>
  );
}