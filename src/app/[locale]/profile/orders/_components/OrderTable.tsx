"use client";

import React, { useEffect, useState } from 'react';
import { getUserOrders, deleteOrder, updateOrderStatus } from '@/server';
import { useAppSelector } from '@/redux/hooks';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { formatDate } from '@/lib/utils';
import OrderDetails from './OrderDetails';
import { Loader2 } from 'lucide-react';

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAppSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await updateOrderStatus(orderId, 'Cancelled');
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

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

  const canCancelOrder = (status) => {
    return ['Pending', 'Processing'].includes(status);
  };

  return (
    <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-6">My Orders</h1>
    
    {loading ? (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : orders.length === 0 ? (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">You don't have any orders yet</p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    ) : (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">
                  {order._id.substring(0, 8)}...
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </Button>
                    
                    {canCancelOrder(order.status) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this order? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep order</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              Yes, cancel order
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}

    {selectedOrder && (
      <OrderDetails 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        onCancel={canCancelOrder(selectedOrder.status) ? () => handleCancelOrder(selectedOrder._id) : null}
      />
    )}
  </div>
  )
}
