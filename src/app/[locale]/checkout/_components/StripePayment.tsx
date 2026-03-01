// src/app/[locale]/checkout/_components/StripePayment.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { createStripeCheckoutSession } from "@/server";
import { getCartSummary } from "@/lib/cart";
import toast from "react-hot-toast";
import { Loader2, CreditCard, Lock } from "lucide-react";

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
}

interface StripePaymentProps {
  shippingAddress: ShippingAddress;
  customerNote?: string;
  coupon?: string;
  t: any;
  locale: string;
  disabled?: boolean;
}

export default function StripePayment({
  shippingAddress,
  customerNote,
  coupon,
  t,
  locale,
  disabled,
}: StripePaymentProps) {
  const { data: cartData } = useCart();
  const [loading, setLoading] = useState(false);

  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const appliedCoupon = cart?.appliedCoupon;
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  const summary = getCartSummary(cartItems, couponDiscount);
  const isRTL = locale === "ar";

  const validateForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      toast.error(isRTL ? "الاسم مطلوب" : "Full name is required");
      return false;
    }
    if (!shippingAddress.addressLine1.trim()) {
      toast.error(isRTL ? "العنوان مطلوب" : "Address is required");
      return false;
    }
    if (!shippingAddress.city.trim()) {
      toast.error(isRTL ? "المدينة مطلوبة" : "City is required");
      return false;
    }
    if (!shippingAddress.country.trim()) {
      toast.error(isRTL ? "البلد مطلوب" : "Country is required");
      return false;
    }
    if (!shippingAddress.phoneNumber.trim()) {
      toast.error(isRTL ? "رقم الهاتف مطلوب" : "Phone number is required");
      return false;
    }
    return true;
  };

  const handleStripeCheckout = async () => {
    if (!validateForm()) return;

    if (!cartItems || cartItems.length === 0) {
      toast.error(t.checkout?.emptyCartError || "Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Prepare items for Stripe
      const items = cartItems.map((item: any) => {
        const product = item.product;
        const price = item.discountedPrice > 0 ? item.discountedPrice : item.price;
        const name = isRTL
          ? product?.productNameAr || product?.productNameEn
          : product?.productNameEn || product?.productNameAr;

        return {
          id: product?._id,
          name: name || "Product",
          price: price || 0,
          quantity: item.quantity || 1,
          image: product?.productImage || "",
          description: isRTL
            ? product?.productDescriptionAr?.substring(0, 100)
            : product?.productDescriptionEn?.substring(0, 100),
        };
      });

      const response = await createStripeCheckoutSession({
        items,
        shippingAddress: JSON.stringify(shippingAddress),
        phoneNumber: shippingAddress.phoneNumber,
        total: summary.total,
        discount: summary.couponDiscount,
        coupon: coupon || appliedCoupon?.code || "",
        customerNote: customerNote || "",
        locale,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else if (response.data?.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
      } else {
        toast.error(t.checkout?.paymentError || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      toast.error(
        error.response?.data?.message || t.checkout?.paymentError || "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={handleStripeCheckout}
        disabled={loading || disabled}
        className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.checkout?.processing || "Processing..."}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {t.checkout?.payWithStripe || "Pay with Card"} - ${summary.total.toFixed(2)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>{t.checkout?.securePayment || "Secure payment powered by Stripe"}</span>
      </div>
    </div>
  );
}