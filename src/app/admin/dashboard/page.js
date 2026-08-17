"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CustomerChart from "@/components/dashboard/CustomerChart";
import StockReport from "@/components/dashboard/StockReport";
import TopProducts from "@/components/dashboard/TopProducts";

import {
  revenueData,
  customerSplitData,
  stockReportData,
  topProductsData,
  periodOptions,
} from "@/data/dashboardData";

export default function DashboardPage() {
  const [period, setPeriod] = useState("year");

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = sessionStorage.getItem("pm_admin_token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const dashboard = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/details`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );


        setDashboardData(dashboard.data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const stats = dashboardData.stats;


  const statsData = [
    {
      id: "products",
      label: "Total Products",
      value: stats?.totalProducts || 0,
      formattedValue: String(stats?.totalProducts || 0),
      icon: "package",
      trend: "up",
      delta: 0,
      deltaLabel: "0",
      sparkline: []
    },

    {
      id: "orders",
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      formattedValue: String(stats?.totalOrders || 0),
      icon: "shopping-cart",
      trend: "up",
      delta: 0,
      deltaLabel: "0",
      sparkline: []
    },

    {
      id: "users",
      label: "Total Users",
      value: stats?.totalUsers || 0,
      formattedValue: String(stats?.totalUsers || 0),
      icon: "users",
      trend: "up",
      delta: 0,
      deltaLabel: "0",
      sparkline: []
    },

    {
      id: "pendingOrders",
      label: "Pending Orders",
      value: stats?.pendingOrders || 0,
      formattedValue: String(stats?.pendingOrders || 0),
      icon: "clock",
      trend: "up",
      delta: 0,
      deltaLabel: "0",
      sparkline: []
    },

    {
      id: "payment",
      label: "Total Payment Received",
      value: Number(stats?.totalPaymentReceived || 0),
      formattedValue: `₹${Number(
        stats?.totalPaymentReceived || 0
      ).toFixed(2)}`,
      icon: "credit-card",
      trend: "up",
      delta: 0,
      deltaLabel: "0",
      sparkline: []
    },

    {
      id: "lowStock",
      label: "Low Stock Variants",
      value: stats?.lowStockVariants || 0,
      formattedValue: String(stats?.lowStockVariants || 0),
      icon: "alert-triangle",
      // trend: "down",
      // delta: 0,
      // deltaLabel: "0",
      sparkline: []
    },
  ];

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      <DashboardHeader
        periodOptions={periodOptions}
        period={period}
        onPeriodChange={setPeriod}
      />

      <DashboardStats stats={statsData} />

      {/* <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RevenueChart data={revenueData} />

        <CustomerChart data={customerSplitData} />
      </div> */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StockReport items={dashboardData.recentOrders} />

        <TopProducts products={topProductsData} />
      </div>
    </div>
  );
}