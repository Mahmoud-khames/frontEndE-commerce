"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { activeCoupon, getCouponDiscount } from '@/lib/cart';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { applyCoupon, selectCartItems } from '@/redux/features/cart/cartSlice';
import { toast } from 'react-toastify';

export default function CouponForm() {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const validationResult = await activeCoupon(couponCode);
      
      if (!validationResult.valid) {
        toast.error(validationResult.message || 'Invalid or expired coupon');
        setLoading(false);
        return;
      }

      const subtotal = cartItems.reduce((total, item) => 
        total + (item.product.productPrice * item.quantity), 0);
      
      const discountResult = await getCouponDiscount(couponCode, subtotal);
      
      if (discountResult.error) {
        toast.error(discountResult.error);
        setLoading(false);
        return;
      }
      
      dispatch(applyCoupon({ 
        coupon: couponCode, 
        total: subtotal 
      }));
      
      toast.success('Coupon applied successfully');
      setCouponCode('');
    } catch (error) {
      toast.error('Error applying coupon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <Button 
          onClick={handleApplyCoupon} 
          disabled={loading}
        >
          {loading ? 'Applying...' : 'Apply'}
        </Button>
      </div>
    </div>
  );
}
