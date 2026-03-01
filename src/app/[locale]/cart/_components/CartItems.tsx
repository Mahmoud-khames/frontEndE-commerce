// src/app/[locale]/cart/_components/CartItems.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert"; // UI Component
import Link from "@/components/link";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Truck,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
  useValidateCart,
} from "@/hooks/useCart";
import type { CartItem } from "@/types";
import { cn } from "@/lib/utils";

export interface CartItemsProps {
  translations: any;
  locale: string;
}

const DELIVERY_FEE = 10;
const FREE_SHIPPING_THRESHOLD = 100;

function CartItems({ translations, locale }: CartItemsProps) {
  const { data: cartResponse, isLoading, isError, error, refetch } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const applyCouponMutation = useApplyCoupon();
  const removeCouponMutation = useRemoveCoupon();
  const validateCartMutation = useValidateCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const isRTL = locale === "ar";
  const t = translations.cart;

  // Extract cart data
  const cart = cartResponse?.data;
  const summary = cartResponse?.summary;
  const cartItems = cart?.items || [];

  // Calculate derived values
  const calculations = useMemo(() => {
    if (!cart || !summary) {
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

    const subtotal = summary.subtotal;
    const productDiscount = summary.totalDiscount;
    const couponDiscount = summary.couponDiscount || 0;
    const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const deliveryFee = hasFreeShipping ? 0 : DELIVERY_FEE;
    const total = summary.total + deliveryFee;
    const amountToFreeShipping = Math.max(
      0,
      FREE_SHIPPING_THRESHOLD - subtotal
    );

    return {
      subtotal,
      productDiscount,
      couponDiscount,
      deliveryFee,
      total,
      itemsCount: summary.itemsCount,
      hasFreeShipping,
      amountToFreeShipping,
    };
  }, [cart, summary]);

  // Handlers
  const handleUpdateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) return;

      setUpdatingItemId(productId);
      try {
        await updateCartItemMutation.mutateAsync({
          productId,
          data: { quantity },
        });
      } finally {
        setUpdatingItemId(null);
      }
    },
    [updateCartItemMutation]
  );

  const handleRemoveItem = useCallback(
    async (productId: string) => {
      if (!productId) return;

      setRemovingItemId(productId);
      try {
        await removeFromCartMutation.mutateAsync(productId);
      } finally {
        setRemovingItemId(null);
      }
    },
    [removeFromCartMutation]
  );

  const handleClearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError(
        isRTL ? "الرجاء إدخال كود الكوبون" : "Please enter a coupon code"
      );
      return;
    }

    setCouponError("");
    try {
      await applyCouponMutation.mutateAsync(couponCode.trim().toUpperCase());
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid coupon");
    }
  }, [couponCode, applyCouponMutation, isRTL]);

  const handleRemoveCoupon = useCallback(() => {
    removeCouponMutation.mutate();
    setCouponCode("");
    setCouponError("");
  }, [removeCouponMutation]);

  const handleValidateCart = useCallback(async () => {
    const result = await validateCartMutation.mutateAsync();
    return result.valid;
  }, [validateCartMutation]);

  // Loading State
  if (isLoading) {
    return <CartSkeleton />;
  }

  // Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isRTL
              ? "حدث خطأ أثناء تحميل السلة"
              : "Error loading cart. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          {isRTL ? "إعادة المحاولة" : "Try Again"}
        </Button>
      </div>
    );
  }

  // Empty Cart State
  if (!cartItems || cartItems.length === 0) {
    return <EmptyCart translations={translations} locale={locale} />;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-8">
      {/* Free Shipping Banner */}
      {!calculations.hasFreeShipping && (
        <Alert className="bg-blue-50 border-blue-200">
          <Truck className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {isRTL
              ? `أضف ${formatCurrency(
                  calculations.amountToFreeShipping
                )} للحصول على شحن مجاني!`
              : `Add ${formatCurrency(
                  calculations.amountToFreeShipping
                )} more for free shipping!`}
          </AlertDescription>
        </Alert>
      )}

      {calculations.hasFreeShipping && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {isRTL
              ? "🎉 لقد حصلت على شحن مجاني!"
              : "🎉 You qualify for free shipping!"}
          </AlertDescription>
        </Alert>
      )}

      {/* Cart Items Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center min-w-[250px]">
                {t.product}
              </TableHead>
              <TableHead className="text-center">{t.price}</TableHead>
              <TableHead className="text-center">{t.quantity}</TableHead>
              <TableHead className="text-center">{t.total}</TableHead>
              <TableHead className="text-center w-[80px]">
                {t.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems.map((item) => (
              <CartItemRow
                key={`${item.product._id}-${item.size}-${item.color}`}
                item={item}
                locale={locale}
                translations={translations}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                isUpdating={updatingItemId === item.product._id}
                isRemoving={removingItemId === item.product._id}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Link
          href={`/${locale}/products`}
          className="text-black font-semibold border-2 border-black px-8 py-3 hover:bg-black hover:text-white transition-all duration-300 text-center"
        >
          {t.returnToShop}
        </Link>
        <Button
          variant="destructive"
          size="lg"
          className="px-8"
          onClick={handleClearCart}
          disabled={clearCartMutation.isPending}
        >
          {clearCartMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {t.clearCart}
        </Button>
      </div>

      {/* Coupon & Summary Section */}
      <div className="flex flex-col lg:flex-row w-full gap-8 justify-between items-start">
        {/* Coupon Section */}
        <div className="w-full lg:w-auto space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-5 w-5" />
            <span className="font-semibold">
              {isRTL ? "كود الخصم" : "Discount Code"}
            </span>
          </div>

          {!cart?.appliedCoupon ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t.couponCode}
                  className="w-[200px] md:w-[250px] h-12 uppercase"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyCoupon();
                  }}
                />
                <Button
                  variant="default"
                  className="h-12 px-6 bg-black hover:bg-gray-800"
                  onClick={handleApplyCoupon}
                  disabled={applyCouponMutation.isPending || !couponCode.trim()}
                >
                  {applyCouponMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t.applyCoupon
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="text-sm text-red-500">{couponError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">
                  {cart.appliedCoupon.code}
                </p>
                <p className="text-sm text-green-600">
                  {cart.appliedCoupon.discountType === "percentage"
                    ? `${cart.appliedCoupon.discountValue}% off`
                    : `${formatCurrency(cart.appliedCoupon.discountValue)} off`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleRemoveCoupon}
                disabled={removeCouponMutation.isPending}
              >
                {removeCouponMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <Card className="w-full lg:w-[420px] p-6 border-2 border-black rounded-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t.orderSummary}
          </h3>

          <div className="space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-gray-600">
              <span>{t.subtotal}</span>
              <span>{formatCurrency(calculations.subtotal)}</span>
            </div>

            {/* Product Discount */}
            {calculations.productDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t.productDiscount || t.discount}</span>
                <span>-{formatCurrency(calculations.productDiscount)}</span>
              </div>
            )}

            {/* Coupon Discount */}
            {calculations.couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {t.couponDiscount || "Coupon"}
                  <Badge variant="secondary" className="text-xs">
                    {cart?.appliedCoupon?.code}
                  </Badge>
                </span>
                <span>-{formatCurrency(calculations.couponDiscount)}</span>
              </div>
            )}

            {/* Delivery Fee */}
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {t.deliveryFee}
              </span>
              <span
                className={cn(
                  calculations.hasFreeShipping && "text-green-600 font-semibold"
                )}
              >
                {calculations.hasFreeShipping
                  ? isRTL
                    ? "مجاني"
                    : "FREE"
                  : formatCurrency(calculations.deliveryFee)}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Total */}
            <div className="flex justify-between text-xl font-bold">
              <span>{t.total}</span>
              <span>{formatCurrency(calculations.total)}</span>
            </div>

            {/* Savings Summary */}
            {(calculations.productDiscount > 0 ||
              calculations.couponDiscount > 0) && (
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-green-700 font-semibold">
                  {isRTL ? "وفرت " : "You saved "}
                  {formatCurrency(
                    calculations.productDiscount + calculations.couponDiscount
                  )}
                  ! 🎉
                </p>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <Link
            href={`/${locale}/checkout`}
            className="mt-6 w-full bg-black text-white py-4 text-center block font-semibold hover:bg-gray-800 transition-all duration-300"
            onClick={async (e) => {
              // Validate cart before proceeding
              const isValid = await handleValidateCart();
              if (!isValid) {
                e.preventDefault();
              }
            }}
          >
            {validateCartMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              t.proceedToCheckout
            )}
          </Link>
        </Card>
      </div>
    </div>
  );
}

// Cart Item Row Component
interface CartItemRowProps {
  item: CartItem;
  locale: string;
  translations: CartItemsProps["translations"];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

function CartItemRow({
  item,
  locale,
  translations,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving,
}: CartItemRowProps) {
  const isRTL = locale === "ar";
  const t = translations.cart;

  const product = item.product;
  if (!product) return null;

  const productName = isRTL ? product.productNameAr : product.productNameEn;
  const effectivePrice =
    item.discountedPrice > 0 ? item.discountedPrice : item.price;
  const hasDiscount =
    item.discountedPrice > 0 && item.discountedPrice < item.price;
  const itemTotal = effectivePrice * item.quantity;
  const isOutOfStock = !item.isAvailable;
  const isLimitedStock =
    item.stockQuantity && item.stockQuantity < 10 && item.stockQuantity > 0;

  return (
    <TableRow
      className={cn(
        "transition-opacity duration-300",
        isRemoving && "opacity-50",
        isOutOfStock && "bg-red-50"
      )}
    >
      {/* Product Info */}
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.productImage ? (
              <Image
                src={product.productImage}
                alt={productName || "Product"}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {t.outOfStock}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Link
              href={`/${locale}/products/${product.productSlug || product._id}`}
              className="font-semibold hover:underline line-clamp-2"
            >
              {productName || "Unknown Product"}
            </Link>

            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              {item.size && (
                <Badge variant="outline" className="text-xs">
                  {t.size}: {item.size}
                </Badge>
              )}
              {item.color && (
                <Badge variant="outline" className="text-xs">
                  {t.colors}: {item.color}
                </Badge>
              )}
            </div>

            {isLimitedStock && !isOutOfStock && (
              <p className="text-xs text-orange-600 font-medium">
                {isRTL
                  ? `متبقي ${item.stockQuantity} فقط!`
                  : `Only ${item.stockQuantity} left!`}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Price */}
      <TableCell className="text-center">
        <div className="space-y-1">
          <span
            className={cn("font-semibold", hasDiscount && "text-green-600")}
          >
            {formatCurrency(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="block text-sm text-gray-400 line-through">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>
      </TableCell>

      {/* Quantity */}
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(product._id, item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating || isRemoving}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span
            className={cn(
              "w-12 text-center font-semibold",
              isUpdating && "opacity-50"
            )}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              item.quantity
            )}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(product._id, item.quantity + 1)}
            disabled={
              isUpdating ||
              isRemoving ||
              (item.stockQuantity !== undefined &&
                item.quantity >= item.stockQuantity)
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

      {/* Total */}
      <TableCell className="text-center font-bold">
        {formatCurrency(itemTotal)}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(product._id)}
          disabled={isRemoving || isUpdating}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Empty Cart Component
function EmptyCart({
  translations,
  locale,
}: {
  translations: CartItemsProps["translations"];
  locale: string;
}) {
  const t = translations.cart;
  const isRTL = locale === "ar";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
        <ShoppingBag className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-semibold">{t.emptyCart}</h2>
      <p className="text-gray-500 max-w-md">{t.emptyCartMessage}</p>
      <Link
        href={`/${locale}/products`}
        className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-all duration-300"
      >
        {t.startShopping}
      </Link>
    </div>
  );
}

// Loading Skeleton
function CartSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-[300px] w-[400px]" />
      </div>
    </div>
  );
}

export default CartItems;
