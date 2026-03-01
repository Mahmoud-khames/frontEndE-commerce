// src/app/[locale]/profile/orders/_components/OrderDetails.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import {
  Package,
  MapPin,
  Phone,
  CreditCard,
  Tag,
  Calendar,
  Truck,
  DollarSign,
  Gift,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";

interface OrderDetailsProps {
  order: any;
  onClose: () => void;
  onCancel?: () => void;
  t: any;
  locale: string;
}

export default function OrderDetails({
  order,
  onClose,
  onCancel,
  t,
  locale,
}: OrderDetailsProps) {
  if (!order) return null;

  const isRTL = locale === "ar";

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: {
        label: isRTL ? "قيد الانتظار" : "Pending",
        variant: "secondary",
      },
      confirmed: { label: isRTL ? "مؤكد" : "Confirmed", variant: "default" },
      processing: {
        label: isRTL ? "قيد المعالجة" : "Processing",
        variant: "default",
      },
      shipped: { label: isRTL ? "تم الشحن" : "Shipped", variant: "default" },
      delivered: {
        label: isRTL ? "تم التوصيل" : "Delivered",
        variant: "default",
      },
      cancelled: {
        label: isRTL ? "ملغي" : "Cancelled",
        variant: "destructive",
      },
    };
    return (
      statusMap[status.toLowerCase()] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  const statusInfo = getStatusInfo(order.status);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy 'at' HH:mm");
    } catch {
      return dateString;
    }
  };

  const getProductName = (item: any) => {
    if (!item.product) return isRTL ? "منتج" : "Product";
    return isRTL
      ? item.product.productNameAr || item.product.productNameEn
      : item.product.productNameEn || item.product.productNameAr;
  };

  const formatShippingAddress = (address: any): string => {
    if (typeof address === "string") return address;
    if (typeof address === "object" && address !== null) {
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.country,
        address.postalCode,
      ].filter(Boolean);
      return parts.join(", ");
    }
    return isRTL ? "لا يوجد عنوان" : "No address";
  };

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            {isRTL ? "تفاصيل الطلب" : "Order Details"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {isRTL ? "تم في" : "Placed on"} {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Status & Number */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isRTL ? "رقم الطلب" : "Order Number"}
                  </p>
                  <p className="font-mono font-bold">
                    #{order.orderNumber || order._id.substring(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isRTL ? "الحالة" : "Status"}
                  </p>
                  <Badge variant={statusInfo.variant} className="text-sm">
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Shipping Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              {isRTL ? "معلومات الشحن" : "Shipping Information"}
            </h3>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {isRTL ? "العنوان" : "Address"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatShippingAddress(order.shippingAddress)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {isRTL ? "الهاتف" : "Phone"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {isRTL ? "طريقة الدفع" : "Payment Method"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {isRTL ? "المنتجات" : "Order Items"}
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.productImage ? (
                          <Image
                            src={item.product.productImage}
                            alt={getProductName(item)}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">
                          {getProductName(item)}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
                          <span>
                            {isRTL ? "الكمية" : "Qty"}: {item.quantity}
                          </span>
                          {item.size && (
                            <>
                              <span>•</span>
                              <span>
                                {isRTL ? "المقاس" : "Size"}: {item.size}
                              </span>
                            </>
                          )}
                          {item.color && (
                            <>
                              <span>•</span>
                              <span>
                                {isRTL ? "اللون" : "Color"}: {item.color}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)}{" "}
                          {isRTL ? "للقطعة" : "each"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {isRTL ? "ملخص الطلب" : "Order Summary"}
            </h3>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isRTL ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span>
                    {formatCurrency(
                      order.totalAmount - (order.discountAmount || 0)
                    )}
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      {isRTL ? "الخصم" : "Discount"}
                    </span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}

                {order.couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {isRTL ? "الكوبون" : "Coupon"}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {order.couponApplied}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>{isRTL ? "الإجمالي" : "Total"}</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">{isRTL ? "إغلاق" : "Close"}</Button>
          </DialogClose>
          {onCancel && (
            <Button variant="destructive" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              {isRTL ? "إلغاء الطلب" : "Cancel Order"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
