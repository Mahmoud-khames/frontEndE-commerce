// src/lib/cart.ts
import type { CartItem } from "@/types";

export const deliveryFee = 10;
export const FREE_SHIPPING_THRESHOLD = 100;

/**
 * Calculate subtotal from cart items
 */
export function getSubTotal(items: CartItem[]): number {
  if (!items || items.length === 0) return 0;
  
  return items.reduce((total, item) => {
    if (!item.product) return total;
    
    // Use discounted price if available, otherwise regular price
    const price = item.discountedPrice > 0 
      ? item.discountedPrice 
      : item.price || item.product.productPrice || 0;
    
    return total + (price * item.quantity);
  }, 0);
}

/**
 * Calculate total discount from cart items
 */
export function getTotalDiscount(items: CartItem[]): number {
  if (!items || items.length === 0) return 0;
  
  return items.reduce((total, item) => {
    if (!item.product) return total;
    
    if (item.discountedPrice > 0 && item.price > item.discountedPrice) {
      const discount = (item.price - item.discountedPrice) * item.quantity;
      return total + discount;
    }
    return total;
  }, 0);
}

/**
 * Get delivery fee based on subtotal
 */
export function getDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : deliveryFee;
}

/**
 * Calculate total with delivery
 */
export function getTotalWithDelivery(subtotal: number, discount: number = 0): number {
  const delivery = getDeliveryFee(subtotal);
  return Math.max(0, subtotal - discount + delivery);
}

/**
 * Format cart summary
 */
export function getCartSummary(items: CartItem[], couponDiscount: number = 0) {
  const subtotal = getSubTotal(items);
  const productDiscount = getTotalDiscount(items);
  const delivery = getDeliveryFee(subtotal);
  const total = subtotal - couponDiscount + delivery;
  
  return {
    subtotal,
    productDiscount,
    couponDiscount,
    delivery,
    total: Math.max(0, total),
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    hasFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}