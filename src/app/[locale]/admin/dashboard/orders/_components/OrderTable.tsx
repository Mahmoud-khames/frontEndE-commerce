"use client";

import React, { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, deleteOrder } from "@/server";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Loader2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import OrderDetails from "./OrderDetails";

export default function OrdersTable({ t, locale }: { t: any; locale: string }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      if (response.data.success) {
        toast.success("Order status updated successfully");
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await deleteOrder(orderId);
      if (response.data.success) {
        toast.success("Order deleted successfully");
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(response.data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case t.admin.pending:
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
      case t.admin.processing:
        return "bg-blue-100 text-blue-800";
      case "Shipped":
      case t.admin.shipped:
        return "bg-purple-100 text-purple-800";
      case "Delivered":
      case t.admin.delivered:
        return "bg-green-100 text-green-800";
      case "Cancelled":
      case t.admin.cancelled:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Add a helper function to translate status
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "Pending": return t.admin.pending;
      case "Processing": return t.admin.processing;
      case "Shipped": return t.admin.shipped;
      case "Delivered": return t.admin.delivered;
      case "Cancelled": return t.admin.cancelled;
      default: return status;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t.admin.manageOrders}</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.orderId}</TableHead>
                <TableHead>{t.admin.customer}</TableHead>
                <TableHead>{t.admin.date}</TableHead>
                <TableHead>{t.admin.total}</TableHead>
                <TableHead>{t.admin.status}</TableHead>
                <TableHead>{t.admin.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    {t.admin.noOrdersFound}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order : any) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order._id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {order.user?.firstName} {order.user?.lastName}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value)
                        }
                      >
                        <SelectTrigger
                          className={`w-[130px] ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <SelectValue placeholder={getStatusTranslation(order.status)} />
                        </SelectTrigger>
                        <SelectContent className="bg-white ">
                          <SelectItem value="Pending" className="text-yellow-800">
                            {t.admin.pending}
                          </SelectItem>
                          <SelectItem value="Processing" className="text-blue-800">
                            {t.admin.processing}
                          </SelectItem>
                          <SelectItem value="Shipped" className="text-purple-800">
                            {t.admin.shipped}
                          </SelectItem>
                          <SelectItem value="Delivered" className="text-green-800">
                            {t.admin.delivered}
                          </SelectItem>
                          <SelectItem value="Cancelled" className="text-red-800">
                            {t.admin.cancelled}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> {t.admin.view}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              {t.admin.delete}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t.admin.deleteOrder}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.admin.deleteOrderConfirmation}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t.admin.cancel}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order._id)}
                              >
                                {t.admin.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetails
          t={t}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        
          locale={locale}
        />
      )}
    </div>
  );
}
