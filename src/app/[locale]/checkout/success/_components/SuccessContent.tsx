// src/app/[locale]/checkout/success/_components/SuccessContent.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useClearCart } from "@/hooks/useCart";
import { verifyStripePayment } from "@/server";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertTriangle,
  Package,
  Mail,
  Loader2,
  ShoppingBag,
  ArrowRight,
  XCircle,
  RefreshCw,
  Truck,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

interface OrderDetails {
  success: boolean;
  status: string;
  orderId?: string;
  orderNumber?: string;
  customer?: {
    email?: string;
    name?: string;
  };
  amount?: number;
  metadata?: Record<string, any>;
}

interface SuccessContentProps {
  locale: string;
  t: {
    verifyingPayment?: string;
    paymentVerified?: string;
    paymentVerificationFailed?: string;
    paymentVerificationError?: string;
    networkError?: string;
    invalidSession?: string;
    paymentError?: string;
    orderSuccess?: string;
    orderSuccessMessage?: string;
    verificationOffline?: string;
    orderDetails?: string;
    paymentStatus?: string;
    email?: string;
    viewOrders?: string;
    continueShopping?: string;
    backToCart?: string;
    orderNumber?: string;
    thankYou?: string;
    confirmationEmail?: string;
    estimatedDelivery?: string;
  };
}

export default function SuccessContent({ locale, t }: SuccessContentProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  
  const { mutate: clearCart } = useClearCart();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState(false);
  const [cartCleared, setCartCleared] = useState(false);

  const isRTL = locale === "ar";

  // Clear cart only once
  const handleClearCart = useCallback(() => {
    if (!cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [clearCart, cartCleared]);

  useEffect(() => {
    const verifyPayment = async () => {
      // If we have orderId (from COD), no need to verify with Stripe
      if (orderId && !sessionId) {
        setOrderDetails({
          success: true,
          status: "confirmed",
          orderNumber: orderId,
        });
        handleClearCart();
        setLoading(false);
        return;
      }

      // Stripe payment verification
      if (!sessionId) {
        setError(t.invalidSession || "Invalid session");
        setLoading(false);
        return;
      }

      try {
        const response = await verifyStripePayment(sessionId);
        
        if (response.data?.success) {
          setOrderDetails(response.data);
          handleClearCart();
          toast.success(t.paymentVerified || "Payment verified!");
        } else {
          setError(t.paymentVerificationFailed || "Payment verification failed");
          toast.error(t.paymentVerificationFailed || "Verification failed");
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);

        if (err.message === "Network Error" || !navigator.onLine) {
          setNetworkError(true);
          // Still clear cart on network error - payment likely went through
          handleClearCart();
          toast.error(t.networkError || "Network error");
        } else {
          setError(
            err.response?.data?.message || 
            t.paymentVerificationError || 
            "Verification error"
          );
          toast.error(t.paymentVerificationError || "Error");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, t, handleClearCart]);

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {t.verifyingPayment || (isRTL ? "جاري التحقق من الدفع..." : "Verifying Payment...")}
            </h1>
            <p className="text-gray-500">
              {isRTL ? "يرجى الانتظار بينما نتحقق من طلبك" : "Please wait while we confirm your order"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State (not network error)
  if (error && !networkError) {
    return (
      <div className="container mx-auto py-16 px-4" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-lg mx-auto border-2 border-red-100">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {t.paymentError || (isRTL ? "خطأ في التحقق" : "Verification Error")}
            </h1>
            
            <p className="text-gray-600 mb-8">{error}</p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isRTL ? "إعادة المحاولة" : "Try Again"}
              </Button>
              
              <Link href={`/${locale}/cart`} className="w-full">
                <Button variant="outline" className="w-full">
                  {t.backToCart || (isRTL ? "العودة للسلة" : "Back to Cart")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  return (
    <div className="container mx-auto py-16 px-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="max-w-lg mx-auto border-2 border-green-100">
        <CardContent className="pt-8 pb-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.thankYou || t.orderSuccess || (isRTL ? "شكراً لطلبك!" : "Thank You for Your Order!")}
            </h1>
            
            <p className="text-gray-600">
              {t.orderSuccessMessage || 
                (isRTL 
                  ? "تم تأكيد طلبك بنجاح وسيتم شحنه قريباً"
                  : "Your order has been confirmed and will be shipped soon"
                )
              }
            </p>
          </div>

          {/* Network Error Warning */}
          {networkError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {isRTL ? "تنبيه" : "Note"}
                </p>
                <p className="text-sm text-yellow-700">
                  {t.verificationOffline || 
                    (isRTL 
                      ? "لم نتمكن من التحقق من الدفع بسبب مشكلة في الاتصال، لكن طلبك على الأرجح تم بنجاح."
                      : "We couldn't verify payment due to a network issue, but your order was likely successful."
                    )
                  }
                </p>
              </div>
            </div>
          )}

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t.orderDetails || (isRTL ? "تفاصيل الطلب" : "Order Details")}
              </h2>
              
              <Separator />
              
              {/* Order Number */}
              {(orderDetails.orderNumber || orderDetails.orderId) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {t.orderNumber || (isRTL ? "رقم الطلب" : "Order Number")}
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    #{orderDetails.orderNumber || orderDetails.orderId}
                  </Badge>
                </div>
              )}
              
              {/* Payment Status */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {t.paymentStatus || (isRTL ? "حالة الدفع" : "Payment Status")}
                </span>
                <Badge 
                  variant="default" 
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  {orderDetails.status === "paid" || orderDetails.status === "confirmed"
                    ? (isRTL ? "مدفوع" : "Paid")
                    : orderDetails.status
                  }
                </Badge>
              </div>
              
              {/* Customer Email */}
              {orderDetails.customer?.email && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {t.email || (isRTL ? "البريد الإلكتروني" : "Email")}
                  </span>
                  <span className="font-medium">{orderDetails.customer.email}</span>
                </div>
              )}

              {/* Amount */}
              {orderDetails.amount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {isRTL ? "المبلغ" : "Amount"}
                  </span>
                  <span className="font-bold text-green-600">
                    ${(orderDetails.amount / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Email Confirmation Note */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg mb-6">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              {t.confirmationEmail || 
                (isRTL 
                  ? "سيتم إرسال تأكيد الطلب إلى بريدك الإلكتروني"
                  : "A confirmation email will be sent to your email address"
                )
              }
            </p>
          </div>

          {/* Estimated Delivery */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
            <Truck className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t.estimatedDelivery || (isRTL ? "التوصيل المتوقع" : "Estimated Delivery")}
              </p>
              <p className="text-sm text-gray-600">
                {isRTL ? "3-7 أيام عمل" : "3-7 business days"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/profile/orders`} className="w-full">
              <Button className="w-full h-12 gap-2">
                <Package className="h-4 w-4" />
                {t.viewOrders || (isRTL ? "عرض الطلبات" : "View My Orders")}
              </Button>
            </Link>
            
            <Link href={`/${locale}/products`} className="w-full">
              <Button variant="outline" className="w-full h-12 gap-2">
                <ShoppingBag className="h-4 w-4" />
                {t.continueShopping || (isRTL ? "متابعة التسوق" : "Continue Shopping")}
                <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}