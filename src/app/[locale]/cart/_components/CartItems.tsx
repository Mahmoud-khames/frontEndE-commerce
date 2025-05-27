/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Link from "next/link";
import { deliveryFee, getSubTotal, getTotalWithDelivery, getTotalWithDiscount } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import {
  removeItemFromCart,
  updateItemQuantity,
  fetchCartItems,
  removeFromCartAsync,
  updateCartItemAsync,
  selectCartItems,
  selectDiscount,
  selectAppliedCoupon,
  selectCartLoading,
  clearCart,
  applyCoupon,
  removeCoupon
} from "@/redux/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

function CartItems({
  translations,
  locale,
}: {
  translations: any;
  locale: string;
}) {
  const cart = useAppSelector(selectCartItems);
  const discount = useAppSelector(selectDiscount);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const loading = useAppSelector(selectCartLoading);
  const dispatch = useAppDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coupon, setCoupon] = useState(appliedCoupon || "");
  const isRTL = locale === "ar";
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  
  // Calculate subTotal first
  const subTotal = getSubTotal(cart);
  
  // Then initialize finalTotal with subTotal
  const [finalTotal, setFinalTotal] = useState(subTotal + deliveryFee);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const wasLoggedIn = isLoggedIn;
    setIsLoggedIn(!!token);
    
    // If user was logged in but now isn't, clear the cart
    if (wasLoggedIn && !token) {
      dispatch(clearCart());
    }
    
    // If user is logged in, fetch their cart
    if (token) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, isLoggedIn]);

  const handleRemoveItem = (productId: string) => {
    if (isLoggedIn) {
      // Optimistically update the UI first
      dispatch(removeItemFromCart({ id: productId }));
      // Then send the update to the server
      dispatch(removeFromCartAsync(productId));
    } else {
      dispatch(removeItemFromCart({ id: productId }));
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    
    if (isLoggedIn) {
      // Optimistically update the UI first
      dispatch(updateItemQuantity({ productId, quantity }));
      // Then send the update to the server
      dispatch(updateCartItemAsync({ id: productId, quantity }));
    } else {
      dispatch(updateItemQuantity({ productId, quantity }));
    }
  };

  const handleClearCart = () => {
    // TODO: Add API endpoint for clearing cart if logged in
    dispatch(clearCart());
  };

  const totalWithDiscount = getTotalWithDelivery(subTotal, discount);
  
  useEffect(() => {
    if (appliedCoupon) {
      dispatch(
        applyCoupon({
          coupon: appliedCoupon,
          total: subTotal,
        })
      );
    }
  }, [subTotal, appliedCoupon, dispatch]);

  useEffect(() => {
    const calculateFinalTotal = async () => {
      if (appliedCoupon) {
        try {
          const result = await getTotalWithDiscount(cart, appliedCoupon);
          // Update the final total with the discounted price plus delivery fee
          setFinalTotal(result.total + deliveryFee);
          
          // Make sure the discount is properly displayed in the UI
          if (result.discount > 0 && result.discount !== discount) {
            // If the calculated discount is different from what's in Redux, update it
            dispatch({ 
              type: 'cart/setDiscount', 
              payload: result.discount 
            });
          }
        } catch (error) {
          console.error("Error calculating discount:", error);
          // Fallback to subtotal if there's an error
          setFinalTotal(subTotal + deliveryFee);
        }
      } else {
        // No coupon applied, just use subtotal
        setFinalTotal(subTotal + deliveryFee);
      }
    };
    
    calculateFinalTotal();
  }, [cart, appliedCoupon, subTotal, discount, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {cart && cart.length > 0 ? (
        <>
          <Table dir={isRTL ? "rtl" : "ltr"}>
            <TableHeader>
              <TableRow className="my-4" dir={isRTL ? "rtl" : "ltr"}>
                <TableHead className="text-center">
                  {translations.cart.product}
                </TableHead>
                <TableHead className="text-center">
                  {translations.cart.price}
                </TableHead>
                <TableHead className="text-center">
                  {translations.cart.quantity}
                </TableHead>
                <TableHead className="text-center">
                  {translations.cart.total}
                </TableHead>
                <TableHead className="text-center">
                  {translations.cart.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item) => {
                // Skip rendering if product is null or undefined
                if (!item.product) return null;
                
                return (
                  <TableRow key={item.product._id || `item-${Math.random()}`}>
                    <TableCell
                      className="text-center"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-16">
                          {item.product?.productImage && (
                            <Image
                              src={`${apiURL}${item.product.productImage}`}
                              alt={item.product?.productName || "Product"}
                              fill
                              className="object-contain"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {item.product?.productName || "Unknown Product"}
                          </h4>
                          {item.size && (
                            <span className="text-sm text-muted-foreground">
                              {translations.cart.size}: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <div className="flex gap-1 text-sm text-muted-foreground">
                              <span>{translations.cart.colors}:</span>
                              <span>{item.color}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-center"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {formatCurrency(item.product?.productPrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-center"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {formatCurrency(item.product?.productPrice * item.quantity)}
                    </TableCell>
                    <TableCell
                      className="text-center"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <Button
                        className="bg-secondary hover:bg-destructive cursor-pointer"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product?._id || "")}
                        disabled={!item.product?._id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="my-10 flex flex-col md:flex-row gap-10 justify-between items-center">
            <Link
              href={`/${locale}/products`}
              locale={locale}
              className="text-black font-semibold border-2 border-black px-12 py-4 hover:bg-black hover:text-white transition-all duration-300"
            >
              {translations.cart.returnToShop}
            </Link>
            <Button
              variant="default"
              size="lg"
              className="bg-secondary px-12 py-4 hover:bg-destructive cursor-pointer text-white hover:text-white transition-all duration-300"
              onClick={handleClearCart}
            >
              {translations.cart.clearCart}
            </Button>
          </div>
          <div className="flex flex-col md:flex-row w-full gap-4 justify-between items-start">
            <div className="mt-4 flex flex-col gap-2">
              <Input
                placeholder={translations.cart.couponCode}
                className="w-[250px] md:w-[300px] h-[56px] p-3"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              {!appliedCoupon && (
                <Button
                  variant="default"
                  className="w-[250px] md:w-[300px] h-[56px] cursor-pointer bg-secondary hover:bg-destructive hover:text-white transition-all duration-300"
                  size="sm"
                  onClick={() =>
                    dispatch(applyCoupon({ coupon, total: subTotal }))
                  }
                >
                  {translations.cart.applyCoupon}
                </Button>
              )}
              {appliedCoupon && (
                <Button
                  variant="destructive"
                  className="w-[250px] md:w-[300px] h-[56px] cursor-pointer"
                  size="sm"
                  onClick={() => {
                    dispatch(removeCoupon()); 
                    setCoupon("");
                  }}
                >
                  {translations.cart.removeCoupon}
                </Button>
              )}
              {appliedCoupon && (
                <div className="text-sm text-green-600">
                  {translations.cart.appliedCoupon}:{" "}
                  <span className="font-semibold">{appliedCoupon}</span>
                </div>
              )}
            </div>
            <Card className="mt-6 p-8 w-full md:w-[470px] h-[324px] flex flex-col gap-4 border-2 border-black rounded-md">
              <div className="flex flex-col gap-2">
                <h4 className="text-lg font-semibold">
                  {translations.cart.orderSummary}
                </h4>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex justify-between">
                    <span>{translations.cart.subtotal}</span>
                    <span>${subTotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{translations.cart.discount}</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>{translations.cart.deliveryFee}</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{translations.cart.total}</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/${locale}/checkout`}
                locale={locale}
                className="w-full bg-black text-white py-4 text-center hover:bg-gray-800 transition-all duration-300"
              >
                {translations.cart.proceedToCheckout}
              </Link>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <h2 className="text-2xl font-semibold">
            {translations.cart.emptyCart}
          </h2>
          <p className="text-muted-foreground">
            {translations.cart.emptyCartMessage}
          </p>
          <Link
            href={`/${locale}/products`}
            locale={locale}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all duration-300"
          >
            {translations.cart.startShopping}
          </Link>
        </div>
      )}
    </div>
  );
}

export default CartItems;
