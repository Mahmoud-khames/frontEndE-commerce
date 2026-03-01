// src/app/[locale]/profile/orders/_components/OrderTable.tsx
"use client";

import { useState } from "react";
import { useUserOrders, useCancelOrder } from "@/hooks/useOrders";
import Link from "@/components/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/formatters";
import OrderDetails from "./OrderDetails";
import { 
  Loader2, 
  Package, 
  ShoppingBag, 
  Eye, 
  XCircle,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface OrderTableProps {
  t: any;
  locale: string;
}

export default function OrderTable({ t, locale }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  
  const { data: ordersData, isLoading } = useUserOrders();
  const cancelOrderMutation = useCancelOrder();

  const isRTL = locale === "ar";
  const orders = ordersData?.data || [];

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    cancelOrderMutation.mutate(
      { id: orderToCancel, reason: isRTL ? "إلغاء من قبل المستخدم" : "Cancelled by user" },
      {
        onSuccess: () => {
          setOrderToCancel(null);
        },
      }
    );
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: {
        label: isRTL ? "قيد الانتظار" : "Pending",
        variant: "secondary",
      },
      confirmed: {
        label: isRTL ? "مؤكد" : "Confirmed",
        variant: "default",
      },
      processing: {
        label: isRTL ? "قيد المعالجة" : "Processing",
        variant: "default",
      },
      shipped: {
        label: isRTL ? "تم الشحن" : "Shipped",
        variant: "default",
      },
      delivered: {
        label: isRTL ? "تم التوصيل" : "Delivered",
        variant: "default",
      },
      cancelled: {
        label: isRTL ? "ملغي" : "Cancelled",
        variant: "destructive",
      },
    };

    return statusMap[status.toLowerCase()] || { label: status, variant: "outline" as const };
  };

  const canCancelOrder = (status: string) => {
    return ["pending", "confirmed", "processing"].includes(status.toLowerCase());
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isRTL ? "لا توجد طلبات" : "No Orders Yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isRTL ? "لم تقم بأي طلبات بعد. ابدأ التسوق الآن!" : "You haven't placed any orders yet. Start shopping now!"}
          </p>
          <Link href={`/${locale}/products`}>
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              {isRTL ? "ابدأ التسوق" : "Start Shopping"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isRTL ? "طلباتي" : "My Orders"}
          </CardTitle>
          <CardDescription>
            {isRTL ? `لديك ${orders.length} طلب` : `You have ${orders.length} orders`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "رقم الطلب" : "Order ID"}</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {isRTL ? "التاريخ" : "Date"}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {isRTL ? "المجموع" : "Total"}
                    </div>
                  </TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => {
                  const statusInfo = getStatusInfo(order.status);
                  
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm">
                        #{order.orderNumber || order._id.substring(0, 8)}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {isRTL ? "عرض" : "View"}
                          </Button>

                          {canCancelOrder(order.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setOrderToCancel(order._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {isRTL ? "إلغاء" : "Cancel"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={
            canCancelOrder(selectedOrder.status)
              ? () => {
                  setOrderToCancel(selectedOrder._id);
                  setSelectedOrder(null);
                }
              : undefined
          }
          t={t}
          locale={locale}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!orderToCancel} onOpenChange={() => setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRTL ? "تأكيد إلغاء الطلب" : "Confirm Order Cancellation"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? "هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to cancel this order? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelOrderMutation.isPending}>
              {isRTL ? "لا، احتفظ بالطلب" : "No, keep order"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={cancelOrderMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {cancelOrderMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isRTL ? "نعم، إلغاء الطلب" : "Yes, cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}