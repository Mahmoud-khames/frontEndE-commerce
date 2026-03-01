// src/app/[locale]/checkout/_components/Payment.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { useCart, useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Tag,
  Truck,
  CheckCircle,
  X,
  Loader2,
  Percent,
  Gift,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Constants
const DELIVERY_FEE = 10;
const FREE_SHIPPING_THRESHOLD = 100;

interface PaymentProps {
  trans: any;
  locale: string;
}

export default function Payment({ trans, locale }: PaymentProps) {
  const { data: cartData, isLoading } = useCart();
  const { mutate: applyCoupon, isPending: applyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: removingCoupon } = useRemoveCoupon();

  const isRTL = locale === "ar";

  // Extract cart data
  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const appliedCoupon = cart?.appliedCoupon;

  // Local state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  // Sync coupon input with applied coupon
  useEffect(() => {
    if (appliedCoupon?.code) {
      setCouponCode(appliedCoupon.code);
    }
  }, [appliedCoupon]);

  // Calculate totals
  const calculations = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        subtotal: 0,
        productDiscount: 0,
        couponDiscount: 0,
        deliveryFee: DELIVERY_FEE,
        total: 0,
        itemsCount: 0,
        hasFreeShipping: false,
        amountToFreeShipping: FREE_SHIPPING_THRESHOLD,
      };
    }

    // Calculate subtotal (using effective price)
    const subtotal = cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.discountedPrice > 0 ? item.discountedPrice : item.price;
      return sum + (price * item.quantity);
    }, 0);

    // Calculate product discount
    const productDiscount = cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      if (item.discountedPrice > 0 && item.price > item.discountedPrice) {
        return sum + ((item.price - item.discountedPrice) * item.quantity);
      }
      return sum;
    }, 0);

    // Get coupon discount
    const couponDiscount = appliedCoupon?.discountAmount || 0;

    // Calculate delivery fee
    const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const deliveryFee = hasFreeShipping ? 0 : DELIVERY_FEE;

    // Calculate total
    const total = subtotal - couponDiscount + deliveryFee;

    // Items count
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      productDiscount,
      couponDiscount,
      deliveryFee,
      total: Math.max(0, total),
      itemsCount,
      hasFreeShipping,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    };
  }, [cartItems, appliedCoupon]);

  // Get localized product name
  const getProductName = (item: any) => {
    if (!item.product) return isRTL ? "منتج غير معروف" : "Unknown Product";
    return isRTL
      ? item.product.productNameAr || item.product.productNameEn
      : item.product.productNameEn || item.product.productNameAr;
  };

  // Handle apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError(isRTL ? "الرجاء إدخال كود الكوبون" : "Please enter a coupon code");
      return;
    }

    setCouponError("");
    applyCoupon(couponCode.trim().toUpperCase(), {
      onError: (error: any) => {
        setCouponError(
          error.response?.data?.message || 
          (isRTL ? "كوبون غير صالح" : "Invalid coupon code")
        );
      },
    });
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    removeCoupon(undefined, {
      onSuccess: () => {
        setCouponCode("");
        setCouponError("");
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full md:w-[470px]">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-14 w-14 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <Card className="w-full md:w-[470px]">
        <CardContent className="pt-6 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {trans.cart?.emptyCart || (isRTL ? "السلة فارغة" : "Your cart is empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="w-full md:w-[470px] border-2 border-black rounded-lg"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {trans.checkout?.orderSummary || (isRTL ? "ملخص الطلب" : "Order Summary")}
          </span>
          <Badge variant="secondary">
            {calculations.itemsCount} {isRTL ? "منتج" : "items"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cart Items */}
        <div className="space-y-4 max-h-[250px] overflow-y-auto">
          {cartItems.map((item: any) => {
            const product = item.product;
            if (!product) return null;

            const effectivePrice = item.discountedPrice > 0 
              ? item.discountedPrice 
              : item.price || product.productPrice;
            const hasDiscount = item.discountedPrice > 0 && item.discountedPrice < item.price;

            return (
              <div
                key={`${product._id}-${item.size}-${item.color}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Product Image */}
                  <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.productImage ? (
                      <Image
                        src={product.productImage}
                        alt={getProductName(item)}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    {/* Quantity Badge */}
                    <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">
                      {getProductName(item)}
                    </h4>
                    {/* Size & Color */}
                    {(item.size || item.color) && (
                      <div className="flex gap-1 mt-0.5">
                        {item.size && (
                          <span className="text-xs text-muted-foreground">
                            {item.size}
                          </span>
                        )}
                        {item.size && item.color && (
                          <span className="text-xs text-muted-foreground">•</span>
                        )}
                        {item.color && (
                          <span className="text-xs text-muted-foreground">
                            {item.color}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <span className={cn(
                    "font-semibold text-sm",
                    hasDiscount && "text-green-600"
                  )}>
                    {formatCurrency(effectivePrice * item.quantity)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-muted-foreground line-through block">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Price Details */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {trans.checkout?.subtotal || (isRTL ? "المجموع الفرعي" : "Subtotal")}
            </span>
            <span>{formatCurrency(calculations.subtotal)}</span>
          </div>

          {/* Product Discount */}
          {calculations.productDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {trans.checkout?.productDiscount || (isRTL ? "خصم المنتجات" : "Product Discount")}
              </span>
              <span>-{formatCurrency(calculations.productDiscount)}</span>
            </div>
          )}

          {/* Coupon Discount */}
          {calculations.couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {trans.checkout?.couponDiscount || (isRTL ? "خصم الكوبون" : "Coupon")}
                <Badge variant="outline" className="text-xs ml-1">
                  {appliedCoupon?.code}
                </Badge>
              </span>
              <span>-{formatCurrency(calculations.couponDiscount)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Truck className="h-3 w-3" />
              {trans.checkout?.shipping || (isRTL ? "الشحن" : "Shipping")}
            </span>
            <span className={cn(calculations.hasFreeShipping && "text-green-600 font-medium")}>
              {calculations.hasFreeShipping
                ? isRTL ? "مجاني" : "FREE"
                : formatCurrency(calculations.deliveryFee)}
            </span>
          </div>

          {/* Free Shipping Progress */}
          {!calculations.hasFreeShipping && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
              <Truck className="h-4 w-4" />
              <span>
                {isRTL
                  ? `أضف ${formatCurrency(calculations.amountToFreeShipping)} للشحن المجاني!`
                  : `Add ${formatCurrency(calculations.amountToFreeShipping)} more for free shipping!`}
              </span>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-lg font-bold">
            <span>{trans.checkout?.total || (isRTL ? "الإجمالي" : "Total")}</span>
            <span>{formatCurrency(calculations.total)}</span>
          </div>

          {/* Savings Summary */}
          {(calculations.productDiscount > 0 || calculations.couponDiscount > 0) && (
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-700 font-medium">
                🎉 {isRTL ? "وفرت" : "You saved"}{" "}
                {formatCurrency(calculations.productDiscount + calculations.couponDiscount)}!
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Coupon Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            {trans.checkout?.couponCode || (isRTL ? "كود الخصم" : "Discount Code")}
          </div>

          {!appliedCoupon ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={trans.checkout?.enterCoupon || (isRTL ? "أدخل الكود" : "Enter code")}
                  className="flex-1 h-12 uppercase"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                />
                <Button
                  type="button"
                  className="h-12 px-6 bg-black hover:bg-gray-800"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                >
                  {applyingCoupon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    trans.checkout?.applyCoupon || (isRTL ? "تطبيق" : "Apply")
                  )}
                </Button>
              </div>
              {couponError && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {couponError}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <span className="font-mono font-bold text-green-700">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-xs text-green-600">
                    {appliedCoupon.discountType === "percentage"
                      ? `${appliedCoupon.discountValue}% ${isRTL ? "خصم" : "off"}`
                      : `${formatCurrency(appliedCoupon.discountValue)} ${isRTL ? "خصم" : "off"}`}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                disabled={removingCoupon}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {removingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}