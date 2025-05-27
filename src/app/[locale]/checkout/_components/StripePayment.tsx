"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { selectCartItems, clearCart, selectDiscount, selectAppliedCoupon } from "@/redux/features/cart/cartSlice";
import { createStripeCheckoutSession } from "@/server";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { getTotalWithDelivery } from "@/lib/cart";
import { getSubTotal } from "@/lib/cart";

export default function StripePayment({ 
  shippingAddress, 
  phoneNumber, 
  t, 
  locale 
}: { 
  shippingAddress: string; 
  phoneNumber: string; 
  t: any; 
  locale: string;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems);
  const discount = useAppSelector(selectDiscount);
  const couponApplied = useAppSelector(selectAppliedCoupon);
  const subTotal = getSubTotal(cart);
  const totalWithDiscount = getTotalWithDelivery(subTotal, discount);
  const [loading, setLoading] = useState(false);

  const handleStripeCheckout = async () => {
    if (!shippingAddress || !phoneNumber) {
      toast.error(t.checkout.fillShippingDetails);
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        id: item.id || item._id || item.product?._id,
        name: item.name || item.product?.productName || 'Product',
        price: parseFloat(item.price || item.product?.productPrice || 0),
        quantity: parseInt(item.quantity || 1, 10),
        image: item.image || (item.product?.productImage ? `${process.env.NEXT_PUBLIC_API_URL}${item.product.productImage}` : ''),
        description: item.description || item.product?.description || '',
      }));

      const response = await createStripeCheckoutSession({
        items,
        shippingAddress,
        phoneNumber,
        total: totalWithDiscount,
        discount,
        coupon: couponApplied,
        locale
      });

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else if (response.data && response.data.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
      } else {
        toast.error(t.checkout.paymentError);
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error(error.response?.data?.message || t.checkout.paymentError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStripeCheckout}
      disabled={loading}
      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t.checkout.processing}
        </>
      ) : (
        t.checkout.payWithStripe
      )}
    </Button>
  );
}



