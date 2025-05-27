"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deliveryFee, getTotalWithDelivery, getTotalWithDiscount } from "@/lib/cart";
import { getSubTotal } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import {
  applyCoupon,
  removeCoupon,
  selectAppliedCoupon,
  selectCartItems,
  selectDiscount,
  validateCouponAsync
} from "@/redux/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState, useEffect } from "react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export default function Payment({trans, locale}: {trans: any, locale: string}) {
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const cart = useAppSelector(selectCartItems);
  const discount = useAppSelector(selectDiscount);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const dispatch = useAppDispatch();
  const subTotal = getSubTotal(cart);
  const totalWithDiscount = getTotalWithDelivery(subTotal, discount);
  const [coupon, setCoupon] = useState(appliedCoupon || "");
  const [finalTotal, setFinalTotal] = useState(subTotal + deliveryFee);

  useEffect(() => {
    const calculateFinalTotal = async () => {
      if (appliedCoupon) {
        try {
          const result = await getTotalWithDiscount(cart, appliedCoupon);
          // Update the final total with the discounted price plus delivery fee
          setFinalTotal(result.total + deliveryFee);
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
  }, [cart, appliedCoupon, subTotal, discount]);

  return (
    <div
      className="flex flex-col gap-8 w-full md:w-[527px] rounded-md flex flex-col gap-8 my-10"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* cart items */}
      {cart && cart.length > 0 ? (
        <div className="flex flex-col gap-8">
          {cart.map((item) => (
            <div
              className="flex items-center justify-between"
              key={item.product._id}
            >
              <div className="flex items-center justify-center gap-2">
                <Image
                  src={`${apiURL}${item.product.productImage}`}
                  alt={item.product.productName}
                  width={54}
                  height={54}
                  className="object-contain w-14 h-14"
                />
                <h4 className="text-lg font-semibold">{item.product.productName}</h4>
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-semibold">
                  {formatCurrency(item.product.productPrice)} x {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* details Price */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between border-b border-gray-300 pb-4">
            <span>{trans.checkout.subtotal}</span>
            <span>{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-300 pb-4">
            <span>{trans.checkout.shipping}</span>
            <span>
              {deliveryFee === 0
                ? trans.cart.freeDelivery
                : formatCurrency(deliveryFee)}
            </span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between border-b border-gray-300 pb-4">
              <span>{trans.checkout.discount}</span>
              <span>
                {discount > 0 && (
                  <span className="text-red-600 ml-2">
                    -{formatCurrency(discount)}
                  </span>
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>{trans.checkout.total}</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* payment details */}
      <div className="flex flex-col gap-4">
        <RadioGroup defaultValue="Cash on Delivery">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="PayPal" id="r1" />
            <Label htmlFor="r1">{trans.checkout.paypal}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Stripe" id="r3" />
            <Label htmlFor="r3">{trans.checkout.stripe}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Cash on Delivery" id="r2" />
            <Label htmlFor="r2">{trans.checkout.cashOnDelivery}</Label>
          </div>
        </RadioGroup>
      </div>

      {/* coupon */}
      <div className="mt-4 flex gap-2">
        <Input
          placeholder={trans.checkout.couponCode}
          className="w-[250px] md:w-[300px] h-[56px]"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
        />
        {appliedCoupon === null && (
          <Button
            variant="default"
            className="w-[150px] md:w-[150px] h-[56px] cursor-pointer bg-secondary hover:bg-destructive hover:text-white transition-all duration-300"
            size="sm"
            onClick={() => dispatch(validateCouponAsync({ coupon, total: subTotal }))}
          >
            {trans.checkout.applyCoupon}
          </Button>
        )}

        {appliedCoupon && (
          <Button
            variant="destructive"
            className="w-[150px] md:w-[150px] h-[56px] cursor-pointer"
            size="sm"
            onClick={() => {
              dispatch(removeCoupon());
              setCoupon("");
            }}
          >
            {trans.checkout.removeCoupon}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {appliedCoupon && (
          <div className="text-sm text-green-600">
            {trans.checkout.appliedCoupon}:{" "}
            <span className="font-semibold">{appliedCoupon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
