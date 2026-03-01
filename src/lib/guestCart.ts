// src/lib/guestCart.ts
import type { GuestCartItem } from "@/types";

const GUEST_CART_KEY = "guestCart";

export const guestCartHelper = {
  getItems(): GuestCartItem[] {
    if (typeof window === "undefined") return [];
    
    try {
      const items = localStorage.getItem(GUEST_CART_KEY);
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  },

  addItem(item: GuestCartItem): GuestCartItem[] {
    const items = this.getItems();
    const existingIndex = items.findIndex(
      (i) =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    );

    if (existingIndex > -1) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    return items;
  },

  updateItem(
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ): GuestCartItem[] {
    const items = this.getItems();
    const index = items.findIndex(
      (i) =>
        i.productId === productId &&
        (size ? i.size === size : true) &&
        (color ? i.color === color : true)
    );

    if (index > -1) {
      items[index].quantity = quantity;
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }

    return items;
  },

  removeItem(productId: string, size?: string, color?: string): GuestCartItem[] {
    let items = this.getItems();
    items = items.filter(
      (i) =>
        !(
          i.productId === productId &&
          (size ? i.size === size : true) &&
          (color ? i.color === color : true)
        )
    );

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    return items;
  },

  clear(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  },

  getCount(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },
};