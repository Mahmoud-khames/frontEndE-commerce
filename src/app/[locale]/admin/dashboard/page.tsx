"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getProductsCount, getOrdersCount, getUsersCount } from "@/server";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.user);
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Set loading state
        setStats(prev => ({ ...prev, loading: true }));
        
        // Use individual try/catch for each request to prevent one failure from stopping all
        let productsCount = 0, ordersCount = 0, usersCount = 0;
        
        try {
          const productsRes = await getProductsCount();
          productsCount = productsRes.data.count || 0;
        } catch (error) {
          console.error("Error fetching products count:", error);
          // toast.error("Failed to fetch products count");
        }
        
        try {
          const ordersRes = await getOrdersCount();
          ordersCount = ordersRes.data.count || 0;
        } catch (error) {
          console.error("Error fetching orders count:", error);
          // toast.error("Failed to fetch orders count");
        }
        
        try {
          const usersRes = await getUsersCount();
          usersCount = usersRes.data.count || 0;
        } catch (error) {
          console.error("Error fetching users count:", error);
          // toast.error("Failed to fetch users count");
        }
        
        setStats({
          productsCount,
          ordersCount,
          usersCount,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
        
        if (error.response) {
          toast.error(`Server error: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`);
        } else if (error.request) {
          toast.error("No response received from server. Please check your connection.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 w-full">
        Welcome, {user?.firstName || "Admin"}!
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Total Products</h3>
          <p className="text-2xl">
            {stats.loading ? "Loading..." : stats.productsCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Total Orders</h3>
          <p className="text-2xl">
            {stats.loading ? "Loading..." : stats.ordersCount}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-2xl">
            {stats.loading ? "Loading..." : stats.usersCount}
          </p>
        </div>
      </div>
    </div>
  );
}
