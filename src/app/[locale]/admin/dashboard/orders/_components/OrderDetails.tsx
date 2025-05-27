"use client";

import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define an interface for the order item
interface OrderItem {
  _id: string;
  product?: {
    productImage?: string;
    productName?: string;
  };
  quantity: number;
  price?: number;
  size?: string;
  color?: string;
}

// Helper function for date formatting
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default function OrderDetails({ 
  order, 
  onClose, 
  t, 
  locale,
  onStatusChange 
}: { 
  order: any; 
  onClose: () => void; 
  t: any;
  locale: string;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}) {
  const isArabic = locale === "ar";
  if (!order) return null;
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [status, setStatus] = useState(order.status);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case `${t.admin.pending}`:
        return 'bg-yellow-100 text-yellow-800';
      case `${t.admin.processing}`:
        return 'bg-blue-100 text-blue-800';
      case `${t.admin.shipped}`:
        return 'bg-purple-100 text-purple-800';
      case `${t.admin.delivered}`:
        return 'bg-green-100 text-green-800';
      case `${t.admin.cancelled}`:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusTranslation = (status: string): string => {
    if (!isArabic) return status;
    
    switch (status) {
      case "Processing":
        return "قيد التجهيز";
      case "Shipped":
        return "تم الشحن";
      case "Delivered":
        return "تم التوصيل";
      case "Cancelled":
        return "تم الإلغاء";
      default:
        return status;
    }
  };

  const handleStatusChange = (newStatus: string): void => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(order._id, newStatus);
    }
  };
const isAdmin = true;
  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.admin.orderDetails}</DialogTitle>
          <DialogDescription>
            Order #{order._id.substring(0, 8)}... • Placed on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Status */}
          <div className="flex justify-between items-center">
            <span className="font-medium">{t.admin.status}:</span>
            {isAdmin ? (
              <Select defaultValue={status} onValueChange={handleStatusChange} >
                <SelectTrigger className={`w-[150px] ${getStatusColor(status)}`}>
                  <SelectValue placeholder={status} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Pending" className='hover:bg-secondary hover:text-white'>{t.admin.pending}</SelectItem>
                  <SelectItem value="Processing" className='hover:bg-secondary hover:text-white'>{t.admin.processing}</SelectItem>
                  <SelectItem value="Shipped" className='hover:bg-secondary hover:text-white'>{t.admin.shipped}</SelectItem>
                  <SelectItem value="Delivered" className='hover:bg-secondary hover:text-white'>{t.admin.delivered}</SelectItem>
                  <SelectItem value="Cancelled" className='hover:bg-secondary hover:text-white'>{t.admin.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
                {status}
              </span>
            )}
          </div>

          {/* Customer Information (Admin Only) */}
          {isAdmin && order.user && (
            <div className="border rounded-md p-4 space-y-2">
              <h3 className="font-medium">{t.admin.customerInfo}</h3>
              <p>{t.admin.name}: {order.user.firstName} {order.user.lastName}</p>
              <p>{t.admin.email}: {order.user.email}</p>
              {order.user.phone && <p>{t.admin.phone}: {order.user.phone}</p>}
            </div>  
          )}

          {/* Shipping Information */}
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-medium">{t.admin.shippingInfo}</h3>
            <p>{t.admin.address}: {order.shippingAddress}</p>
            <p>{t.admin.phone}: {order.phoneNumber}</p>
            <p>{t.admin.paymentMethod}: {order.paymentMethod}</p>
          </div>

          {/* Order Items */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">{t.admin.orderItems}</h3>
            <div className="space-y-4">
              {order.items.map((item: OrderItem) => (
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
                      <span>{t.admin.quantity}: {item.quantity}</span>
                      <span>${item.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    {item.size && <span className="text-sm text-gray-500">{t.admin.size}: {item.size}</span>}
                    {item.color && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>{t.admin.color}:</span>
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
            <h3 className="font-medium mb-4">{t.admin.orderSummary}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t.admin.subtotal}:</span>
                <span>${(order.totalAmount - (order.discountAmount || 0)).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t.admin.discount}:</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.couponApplied && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t.admin.couponApplied}:</span>
                  <span>{order.couponApplied}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>{t.admin.total}:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t.admin.close}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}





