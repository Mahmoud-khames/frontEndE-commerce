// src/app/[locale]/checkout/cancel/_components/CancelContent.tsx
"use client";

import { XCircle, ArrowLeft, ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/link";

interface CancelContentProps {
  locale: string;
  t: {
    paymentCancelled?: string;
    paymentCancelledMessage?: string;
    returnToCheckout?: string;
    returnToCart?: string;
    tryAgain?: string;
    needHelp?: string;
    contactSupport?: string;
  };
}

export default function CancelContent({ locale, t }: CancelContentProps) {
  const isRTL = locale === "ar";

  return (
    <div 
      className="container mx-auto py-16 px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Card className="max-w-lg mx-auto border-2 border-red-100">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {t.paymentCancelled || (isRTL ? "تم إلغاء الدفع" : "Payment Cancelled")}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            {t.paymentCancelledMessage || 
              (isRTL 
                ? "تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ من حسابك. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة."
                : "Your payment was cancelled. No charges were made to your account. You can try again or choose a different payment method."
              )
            }
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/checkout`} className="w-full">
              <Button className="w-full h-12 gap-2">
                <RefreshCw className="h-4 w-4" />
                {t.tryAgain || t.returnToCheckout || (isRTL ? "حاول مرة أخرى" : "Try Again")}
              </Button>
            </Link>

            <Link href={`/${locale}/cart`} className="w-full">
              <Button variant="outline" className="w-full h-12 gap-2">
                <ShoppingCart className="h-4 w-4" />
                {t.returnToCart || (isRTL ? "العودة للسلة" : "Return to Cart")}
              </Button>
            </Link>

            <Link href={`/${locale}/products`} className="w-full">
              <Button variant="ghost" className="w-full h-12 gap-2">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                {isRTL ? "متابعة التسوق" : "Continue Shopping"}
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t.needHelp || (isRTL ? "تحتاج مساعدة؟" : "Need help?")}{" "}
              <Link 
                href={`/${locale}/contact`} 
                className="text-primary hover:underline font-medium"
              >
                {t.contactSupport || (isRTL ? "تواصل معنا" : "Contact Support")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}