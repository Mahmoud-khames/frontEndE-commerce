// src/app/[locale]/checkout/_components/OrderSummary.tsx
"use client";

import { useCart, useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart";
import { getCartSummary, FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Tag,
  Truck,
  CheckCircle,
  X,
  Loader2,
  Percent,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderSummaryProps {
  t: any;
  locale: string;
}

export default function OrderSummary({ t, locale }: OrderSummaryProps) {
  const { data: cartData, isLoading } = useCart();
  const { mutate: applyCoupon, isPending: applyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: removingCoupon } = useRemoveCoupon();

  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const appliedCoupon = cart?.appliedCoupon;
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  const summary = getCartSummary(cartItems, couponDiscount);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const isRTL = locale === "ar";

  // Sync coupon input with applied coupon
  useEffect(() => {
    if (appliedCoupon?.code) {
      setCouponCode(appliedCoupon.code);
    }
  }, [appliedCoupon]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError(isRTL ? "الرجاء إدخال كود الكوبون" : "Please enter a coupon code");
      return;
    }

    setCouponError("");
    applyCoupon(couponCode.trim().toUpperCase(), {
      onError: (error: any) => {
        setCouponError(error.response?.data?.message || "Invalid coupon");
      },
    });
  };

  const handleRemoveCoupon = () => {
    removeCoupon(undefined, {
      onSuccess: () => {
        setCouponCode("");
        setCouponError("");
      },
    });
  };

  const getProductName = (item: any) => {
    if (!item.product) return "Unknown Product";
    return isRTL
      ? item.product.productNameAr || item.product.productNameEn
      : item.product.productNameEn || item.product.productNameAr;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          {t.checkout?.orderSummary || "Order Summary"}
          <Badge variant="secondary" className="ml-auto">
            {summary.itemsCount} {isRTL ? "منتج" : "items"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cart Items */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {cartItems.map((item: any) => {
            const product = item.product;
            if (!product) return null;

            const price = item.discountedPrice > 0 ? item.discountedPrice : item.price;
            const hasDiscount = item.discountedPrice > 0 && item.discountedPrice < item.price;

            return (
              <div key={`${product._id}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {getProductName(item)}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.size && (
                      <Badge variant="outline" className="text-xs">
                        {item.size}
                      </Badge>
                    )}
                    {item.color && (
                      <Badge variant="outline" className="text-xs">
                        {item.color}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </span>
                    <div className="text-right">
                      <span className={cn("text-sm font-medium", hasDiscount && "text-green-600")}>
                        {formatCurrency(price * item.quantity)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through block">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Coupon Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t.checkout?.couponCode || "Coupon Code"}
            </span>
          </div>

          {!appliedCoupon ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder={t.checkout?.enterCoupon || "Enter code"}
                  className="uppercase"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                >
                  {applyingCoupon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t.checkout?.apply || "Apply"
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="text-xs text-destructive">{couponError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <span className="font-mono font-bold text-green-700">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-xs text-green-600">
                    {appliedCoupon.discountType === "percentage"
                      ? `${appliedCoupon.discountValue}% off`
                      : `$${appliedCoupon.discountValue} off`}
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

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t.checkout?.subtotal || "Subtotal"}
            </span>
            <span>{formatCurrency(summary.subtotal)}</span>
          </div>

          {/* Product Discount */}
          {summary.productDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {t.checkout?.productDiscount || "Product Discount"}
              </span>
              <span>-{formatCurrency(summary.productDiscount)}</span>
            </div>
          )}

          {/* Coupon Discount */}
          {summary.couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {t.checkout?.couponDiscount || "Coupon Discount"}
              </span>
              <span>-{formatCurrency(summary.couponDiscount)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Truck className="h-3 w-3" />
              {t.checkout?.shipping || "Shipping"}
            </span>
            <span className={cn(summary.hasFreeShipping && "text-green-600 font-medium")}>
              {summary.hasFreeShipping
                ? isRTL ? "مجاني" : "FREE"
                : formatCurrency(summary.delivery)}
            </span>
          </div>

          {/* Free Shipping Progress */}
          {!summary.hasFreeShipping && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
              {isRTL
                ? `أضف ${formatCurrency(FREE_SHIPPING_THRESHOLD - summary.subtotal)} للشحن المجاني`
                : `Add ${formatCurrency(FREE_SHIPPING_THRESHOLD - summary.subtotal)} more for free shipping`}
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-lg font-bold">
            <span>{t.checkout?.total || "Total"}</span>
            <span>{formatCurrency(summary.total)}</span>
          </div>

          {/* Savings */}
          {(summary.productDiscount > 0 || summary.couponDiscount > 0) && (
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <span className="text-green-700 text-sm font-medium">
                🎉 {isRTL ? "وفرت" : "You saved"}{" "}
                {formatCurrency(summary.productDiscount + summary.couponDiscount)}!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}