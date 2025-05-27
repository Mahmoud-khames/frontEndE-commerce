import { CartItem } from '@/redux/features/cart/cartSlice';
import axios from 'axios';

// TODO: get delivery fee from backend with coupon
export const deliveryFee: number = 0;

export const getCartQuantity = (cart: CartItem[]): number => {
  return cart.reduce((quantity, item) => quantity + (item.quantity || 0), 0);
};

export const getSubTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, cartItem) => {
    const itemTotal = (cartItem.product?.productPrice || 0) * (cartItem.quantity || 0);
    return total + itemTotal;
  }, 0);
};

export const getTotalAmount = (cart: CartItem[], discount: number = 0): number => {
  const subtotal = getSubTotal(cart);
  return subtotal - discount;
};

export const activeCoupon = async (couponCode: string): Promise<{valid: boolean; message?: string}> => {
  try {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await axios.get(`${apiURL}/api/coupon/validate/${couponCode}`);
    return {
      valid: response.data.valid,
      message: response.data.message
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return {
      valid: false,
      message: "Error validating coupon"
    };
  }
};

export const getCouponDiscount = async (couponCode: string, total: number): Promise<{discount: number; error?: string}> => {
  try {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await axios.get(`${apiURL}/api/coupon/calculate/${couponCode}?total=${total}`);
    
    if (response.data.error) {
      return { 
        discount: 0,
        error: response.data.error
      };
    }
    
    return { 
      discount: response.data.discount || 0
    };
  } catch (error) {
    console.error("Error calculating discount:", error);
    return { 
      discount: 0,
      error: "Error calculating discount"
    };
  }
};

export const getDeliveryFee = async (couponCode?: string): Promise<number> => {
  // TODO: Implement backend call to get delivery fee with coupon
  return deliveryFee;
};

export const getTotalWithDiscount = async (
  cart: CartItem[],
  couponCode: string
): Promise<{ total: number; discount: number }> => {
  const subtotal = getSubTotal(cart);
  
  if (!couponCode) {
    return { total: subtotal, discount: 0 };
  }
  
  try {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await axios.get(`${apiURL}/api/coupon/calculate/${couponCode}?total=${subtotal}`);
    
    if (response.data.error) {
      return { total: subtotal, discount: 0 };
    }
    
    const discount = response.data.discount || 0;
    const discountedTotal = subtotal - discount;
    
    return { 
      total: discountedTotal, 
      discount: discount 
    };
  } catch (error) {
    console.error("Error calculating discount:", error);
    return { total: subtotal, discount: 0 };
  }
};

export const getTotalWithDelivery = (total: number, discount: number = 0): number => {
  return total + deliveryFee;
};

export const getFinalTotal = (subtotal: number, discount: number = 0): number => {
  return subtotal - discount + deliveryFee;
};

// Synchronous version for the checkout page
export const getCouponDiscountSync = (couponCode: string, total: number): number => {
  // This is a synchronous version that should only be used in reducers
  // It doesn't actually validate the coupon, just returns a placeholder
  // The actual validation should happen in the async version
  
  // For now, just return 0 as we can't make API calls synchronously
  // The real discount will be applied by the async thunk
  return 0;
};

export const getTotalWithDiscountSync = (
  cart: CartItem[],
  couponCode: string,
  discountAmount: number = 0
): number => {
  const subtotal = getSubTotal(cart);
  return subtotal - discountAmount;
};
