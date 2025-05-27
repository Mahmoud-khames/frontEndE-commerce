"use client";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CancelContent({locale, t}: {locale: string, t: any}) {
  return (
    <div className="container mx-auto py-10 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t.paymentCancelled}</h1>
        <p className="mb-6">{t.paymentCancelledMessage}</p>
        
        <div className="flex flex-col space-y-3">
          <Link href={`/${locale}/checkout`}>
            <Button className="w-full">{t.returnToCheckout}</Button>
          </Link>
          <Link href={`/${locale}/cart`}>
            <Button variant="outline" className="w-full">{t.returnToCart}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}