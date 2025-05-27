"use client";

import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

export default function OrderDetails({ order, onClose, onCancel }) {
  if (!order) return null;
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order._id.substring(0, 8)}... • Placed on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Status */}
          <div className="flex justify-between items-center">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          {/* Shipping Information */}
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-medium">Shipping Information</h3>
            <p>Address: {order.shippingAddress}</p>
            <p>Phone: {order.phoneNumber}</p>
            <p>Payment Method: {order.paymentMethod}</p>
          </div>

          {/* Order Items */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                  <div className="w-16 h-16 relative bg-gray-100 rounded">
                    {item.product?.productImage && (
                      <Image
                        src={`${apiURL}${item.product.productImage}`}
                        alt={item.product.productName || 'Product image'}
                        fill
                        className="object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.productName || 'Product'}</h4>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      <span>${item.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    {item.size && <span className="text-sm text-gray-500">Size: {item.size}</span>}
                    {item.color && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>Color:</span>
                        <span 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(order.totalAmount - (order.discountAmount || 0)).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.couponApplied && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Coupon Applied:</span>
                  <span>{order.couponApplied}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {onCancel && (
            <Button variant="destructive" onClick={onCancel}>
              Cancel Order
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}