"use client";

import { useState, useEffect } from "react";
import OrderTable from "@/app/components/ui/OrderTable";
import OrderEditForm from "@/app/components/ui/OrderEditForm";
import TableSkeleton from "@/app/components/ui/TableSkeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  function Token() {
    return sessionStorage.getItem("pm_admin_token");
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/dashboard/all`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Token()}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch orders: ${res.status}`
          );
        }

        const data = await res.json();

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  function handleEditClick(order) {
    setEditingOrder(order);
    setFormOpen(true);
  }

  function handleDelete(id) {
    setOrders((prev) =>
      prev.filter((order) => order.id !== id)
    );
  }

  function handleSave(updatedOrder) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === updatedOrder.id
          ? updatedOrder
          : order
      )
    );
  }

  const filteredOrders = orders.filter((order) => {
    const paymentMatches =
      paymentFilter === "all" ||
      order.paymentStatus?.toLowerCase() === paymentFilter;

    const statusMatches =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter;

    return paymentMatches && statusMatches;
  });

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">
          Orders
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage orders, payments and order status.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          
          {/* Payment */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label
              htmlFor="payment-filter"
              className="shrink-0 text-sm font-medium text-slate-700"
            >
              Payment:
            </label>

            <select
              id="payment-filter"
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value)
              }
              className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 sm:w-[130px] sm:flex-none"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label
              htmlFor="status-filter"
              className="shrink-0 text-sm font-medium text-slate-700"
            >
              Status:
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 sm:w-[150px] sm:flex-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Clear */}
          {(paymentFilter !== "all" ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setPaymentFilter("all");
                setStatusFilter("all");
              }}
              className="self-start text-sm text-slate-500 hover:text-slate-900 sm:self-auto"
            >
              Clear filters
            </button>
          )}

          {/* Count */}
          <div className="text-xs text-slate-400 sm:ml-auto sm:text-sm">
            Showing {filteredOrders.length} of{" "}
            {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <TableSkeleton
          rows={8}
          columns={7}
        />
      ) : (
        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <div className="w-full overflow-x-auto">
            <OrderTable
              orders={filteredOrders}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <OrderEditForm
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editingOrder}
        onSave={handleSave}
      />
    </div>
  );
}