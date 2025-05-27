"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrder } from "@/server";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCartItems, selectDiscount, selectAppliedCoupon, clearCart } from "@/redux/features/cart/cartSlice";
import { getTotalWithDelivery } from "@/lib/cart";
import { getSubTotal } from "@/lib/cart";
import { toast } from "react-toastify";
import StripePayment from "./StripePayment";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

export default function CheckoutForm({ t, locale }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems);
  const discount = useAppSelector(selectDiscount);
  const couponApplied = useAppSelector(selectAppliedCoupon);
  const subTotal = getSubTotal(cart);
  const totalWithDiscount = getTotalWithDelivery(subTotal, discount);
  
  const [formData, setFormData] = useState({
    shippingAddress: "",
    phoneNumber: "",
    paymentMethod: "Cash on Delivery"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cart || cart.length === 0) {
      toast.error(t.checkout.emptyCartError);
      return;
    }
    
    if (!formData.shippingAddress || !formData.phoneNumber) {
      toast.error(t.checkout.fillAllFields);
      return;
    }
    
    // إذا كان الدفع بواسطة Stripe، فلا تقم بإنشاء الطلب هنا
    if (formData.paymentMethod === "Stripe") {
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        ...formData,
        totalAmount: totalWithDiscount,
        couponApplied: couponApplied || null,
        discountAmount: discount || 0
      };
      
      const response = await createOrder(orderData);
      
      if (response.data.success) {
        toast.success(t.checkout.orderSuccess);
        dispatch(clearCart());
        router.push(`/${locale}/profile/orders`);
      } else {
        toast.error(response.data.message || t.checkout.orderError);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error.message || t.checkout.orderError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full md:w-[527px]">
      <h2 className="text-2xl font-bold">{t.checkout.shippingDetails}</h2>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="shippingAddress">{t.checkout.address}</Label>
        <Input
          id="shippingAddress"
          name="shippingAddress"
          value={formData.shippingAddress}
          onChange={handleChange}
          placeholder={t.checkout.addressPlaceholder}
          required
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="phoneNumber">{t.checkout.phone}</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder={t.checkout.phonePlaceholder}
          required
        />
      </div>
      
      <div className="flex flex-col gap-2 mt-4">
        <Label>{t.checkout.paymentMethod}</Label>
        <RadioGroup 
          defaultValue="Cash on Delivery"
          onValueChange={(value) => setFormData(prev => ({...prev, paymentMethod: value}))}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Cash on Delivery" id="cod" />
            <Label htmlFor="cod">{t.checkout.cashOnDelivery}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Stripe" id="stripe" />
            <Label htmlFor="stripe">{t.checkout.stripe}</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.paymentMethod === "Stripe" ? (
        <StripePayment 
          shippingAddress={formData.shippingAddress}
          phoneNumber={formData.phoneNumber}
          t={t}
          locale={locale}
        />
      ) : (
        <Button 
          type="submit" 
          className="w-full h-12 mt-4" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.checkout.processing}
            </>
          ) : (
            t.checkout.placeOrder
          )}
        </Button>
      )}
    </form>
  );
}
