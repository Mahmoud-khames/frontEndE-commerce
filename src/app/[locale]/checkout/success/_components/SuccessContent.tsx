"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { verifyStripePayment } from "@/server";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

export default function SuccessContent({locale, t}: {locale: string, t: any}) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const dispatch = useAppDispatch();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError(t.invalidSession);
        setLoading(false);
        return;
      }

      try {
        const response = await verifyStripePayment(sessionId);
        if (response.data.success) {
          setOrderDetails(response.data);
       
          dispatch(clearCart());
          toast.success(t.paymentVerified);
        } else {
          setError(t.paymentVerificationFailed);
          toast.error(t.paymentVerificationFailed);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        
   
        if (error.message === "Network Error") {
          setNetworkError(true);
          toast.error(t.networkError);
        } else {
          setError(error.response?.data?.message || t.paymentVerificationError);
          toast.error(t.paymentVerificationError);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, dispatch, t]);


  useEffect(() => {
    if (networkError) {
      dispatch(clearCart());
    }
  }, [networkError, dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">{t.verifyingPayment}</h1>
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (error && !networkError) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">{t.paymentError}</h1>
        <p className="mb-6">{error}</p>
        <Link href="/cart">
          <Button variant="outline">{t.backToCart}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t.orderSuccess}</h1>
        <p className="mb-6">{t.orderSuccessMessage}</p>
        
        {networkError && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">{t.verificationOffline}</p>
          </div>
        )}
        
        {orderDetails && (
          <div className="text-left mb-6 bg-gray-50 p-4 rounded-md">
            <h2 className="font-semibold mb-2">{t.orderDetails}</h2>
            <p className="text-sm text-gray-600">{t.paymentStatus}: <span className="font-medium">{orderDetails.status}</span></p>
            {orderDetails.customer && orderDetails.customer.email && (
              <p className="text-sm text-gray-600">{t.email}: <span className="font-medium">{orderDetails.customer.email}</span></p>
            )}
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <Link href= {`/${locale}/profile/orders`}>
            <Button className="w-full">{t.viewOrders}</Button>
          </Link>
          <Link href={`/${locale}/products`}  locale={locale} >
            <Button variant="outline" className="w-full">{t.continueShopping}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
