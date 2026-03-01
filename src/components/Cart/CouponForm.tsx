"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApplyCoupon } from "@/hooks/useCart";
import { toast } from "react-hot-toast";

export default function CouponForm() {
  const [couponCode, setCouponCode] = useState("");
  const applyCouponMutation = useApplyCoupon();

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      await applyCouponMutation.mutateAsync(couponCode);
      toast.success("Coupon applied successfully");
      setCouponCode("");
    } catch (error) {
      toast.error("Error applying coupon");
      console.error(error);
    }
  }, [couponCode, applyCouponMutation]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={applyCouponMutation.isPending}
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={applyCouponMutation.isPending}
        >
          {applyCouponMutation.isPending ? "Applying..." : "Apply"}
        </Button>
      </div>
    </div>
  );
}
