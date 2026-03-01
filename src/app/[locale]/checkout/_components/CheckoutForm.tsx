// src/app/[locale]/checkout/_components/CheckoutForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createOrder } from "@/server";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart, useClearCart } from "@/hooks/useCart";
import { getCartSummary } from "@/lib/cart";
import toast from "react-hot-toast";
import StripePayment from "./StripePayment";
import { Loader2, MapPin, Phone, User, CreditCard, Truck, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface CheckoutFormProps {
  t: any;
  locale: string;
}

type PaymentMethod = "cod" | "stripe";

const initialShippingAddress: ShippingAddress = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  phoneNumber: "",
};

export default function CheckoutForm({ t, locale }: CheckoutFormProps) {
  const router = useRouter();
  const { mutate: clearCart } = useClearCart();
  const { data: cartData, isLoading: cartLoading } = useCart();

  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const appliedCoupon = cart?.appliedCoupon;
  const couponDiscount = appliedCoupon?.discountAmount || 0;

  const summary = getCartSummary(cartItems, couponDiscount);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialShippingAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const isRTL = locale === "ar";

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = isRTL ? "الاسم مطلوب" : "Full name is required";
    }
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = isRTL ? "العنوان مطلوب" : "Address is required";
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = isRTL ? "المدينة مطلوبة" : "City is required";
    }
    if (!shippingAddress.country.trim()) {
      newErrors.country = isRTL ? "البلد مطلوب" : "Country is required";
    }
    if (!shippingAddress.phoneNumber.trim()) {
      newErrors.phoneNumber = isRTL ? "رقم الهاتف مطلوب" : "Phone number is required";
    } else if (!/^[\d\s\-+()]{8,}$/.test(shippingAddress.phoneNumber)) {
      newErrors.phoneNumber = isRTL ? "رقم هاتف غير صالح" : "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      toast.error(t.checkout?.emptyCartError || "Your cart is empty");
      return;
    }

    if (!validateForm()) {
      toast.error(t.checkout?.fillAllFields || "Please fill all required fields");
      return;
    }

    // If Stripe, don't create order here - StripePayment will handle it
    if (paymentMethod === "stripe") {
      return;
    }

    setLoading(true);

    try {
      const orderData :any= {
        shippingAddress,
        paymentMethod: "cod",
        shippingMethod: "standard",
        customerNote: customerNote || undefined,
        coupon: appliedCoupon?.code || undefined,
        useCart: true,
      };

      const response = await createOrder(orderData);

      if (response.data?.success) {
        toast.success(t.checkout?.orderSuccess || "Order placed successfully!");
        clearCart();
        router.push(`/${locale}/checkout/success?order_id=${response.data.data?._id || response.data.data?.orderNumber}`);
      } else {
        toast.error(response.data?.message || t.checkout?.orderError || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.response?.data?.message || t.checkout?.orderError || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            {t.checkout?.emptyCart || "Your cart is empty"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t.checkout?.shippingDetails || "Shipping Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {t.checkout?.fullName || "Full Name"}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={shippingAddress.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder={t.checkout?.fullNamePlaceholder || "John Doe"}
              className={cn(errors.fullName && "border-destructive")}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">
              {t.checkout?.addressLine1 || "Address Line 1"}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={(e) => handleInputChange("addressLine1", e.target.value)}
              placeholder={t.checkout?.addressPlaceholder || "Street address, P.O. box"}
              className={cn(errors.addressLine1 && "border-destructive")}
            />
            {errors.addressLine1 && (
              <p className="text-xs text-destructive">{errors.addressLine1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine2">
              {t.checkout?.addressLine2 || "Address Line 2"}
            </Label>
            <Input
              id="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={(e) => handleInputChange("addressLine2", e.target.value)}
              placeholder={t.checkout?.addressLine2Placeholder || "Apartment, suite, unit, building, floor, etc."}
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                {t.checkout?.city || "City"}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder={t.checkout?.cityPlaceholder || "City"}
                className={cn(errors.city && "border-destructive")}
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">
                {t.checkout?.state || "State/Province"}
              </Label>
              <Input
                id="state"
                value={shippingAddress.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder={t.checkout?.statePlaceholder || "State/Province"}
              />
            </div>
          </div>

          {/* Country & Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">
                {t.checkout?.country || "Country"}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                value={shippingAddress.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder={t.checkout?.countryPlaceholder || "Country"}
                className={cn(errors.country && "border-destructive")}
              />
              {errors.country && (
                <p className="text-xs text-destructive">{errors.country}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                {t.checkout?.postalCode || "Postal Code"}
              </Label>
              <Input
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                placeholder={t.checkout?.postalCodePlaceholder || "12345"}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {t.checkout?.phone || "Phone Number"}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={shippingAddress.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder={t.checkout?.phonePlaceholder || "+1 234 567 8900"}
              className={cn(errors.phoneNumber && "border-destructive")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Customer Note */}
          <div className="space-y-2">
            <Label htmlFor="customerNote">
              {t.checkout?.orderNotes || "Order Notes (Optional)"}
            </Label>
            <Textarea
              id="customerNote"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={t.checkout?.orderNotesPlaceholder || "Special instructions for delivery..."}
              className="min-h-20 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t.checkout?.paymentMethod || "Payment Method"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            className="space-y-3"
          >
            <div className={cn(
              "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
              paymentMethod === "cod" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            )}>
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                <Banknote className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{t.checkout?.cashOnDelivery || "Cash on Delivery"}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.checkout?.codDescription || "Pay when you receive your order"}
                  </p>
                </div>
              </Label>
            </div>
            
            <div className={cn(
              "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
              paymentMethod === "stripe" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            )}>
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{t.checkout?.stripe || "Credit/Debit Card"}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.checkout?.stripeDescription || "Secure payment via Stripe"}
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Submit Button */}
      {paymentMethod === "stripe" ? (
        <StripePayment
          shippingAddress={shippingAddress}
          customerNote={customerNote}
          coupon={appliedCoupon?.code}
          t={t}
          locale={locale}
          disabled={!validateForm}
        />
      ) : (
        <Button
          type="submit"
          className="w-full h-14 text-lg font-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.checkout?.processing || "Processing..."}
            </>
          ) : (
            <>
              <Truck className="mr-2 h-5 w-5" />
              {t.checkout?.placeOrder || "Place Order"} - ${summary.total.toFixed(2)}
            </>
          )}
        </Button>
      )}
    </form>
  );
}