"use client";

import { useState, useEffect } from "react";
import OrderTable from "@/app/components/ui/OrderTable";
import OrderEditForm from "@/app/components/ui/OrderEditForm";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import OrderDetailModal from "../OrderDetailModal/page";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  function Token() {
    return sessionStorage.getItem("pm_admin_token");
  }

  function handleOrderClick(order) {
    setViewingOrder(order);
    setDetailOpen(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        let url;

        if (debouncedSearch) {
          const params = new URLSearchParams({
            q: debouncedSearch,
            page: page.toString(),
            limit: limit.toString(),
          });

          url = `${baseUrl}/api/orders/dashboard/search?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          url = `${baseUrl}/api/orders/dashboard/all?${params.toString()}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token()}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }

        const data = await res.json();

        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.totalOrders || 0);

        if (data.page) {
          setPage(data.page);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page, limit, debouncedSearch]);

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

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
  }

  function getPageNumbers() {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  }

  function handleClearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setPaymentFilter("all");
    setStatusFilter("all");
    setPage(1);
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
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">
          Orders
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage orders, payments and order status.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 pr-10 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 sm:w-[130px] sm:flex-none"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
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

            {(paymentFilter !== "all" ||
              statusFilter !== "all" ||
              search) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="self-start text-sm text-slate-500 hover:text-slate-900 sm:self-auto"
                >
                  Clear filters
                </button>
              )}

            <div className="text-xs text-slate-400 sm:ml-auto sm:text-sm">
              Showing {filteredOrders.length} of {totalOrders} orders
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} columns={7} />
      ) : (
        <>
          <div className="w-full overflow-hidden rounded-lg border bg-white">
            <div className="w-full overflow-x-auto">
              <OrderTable
                orders={filteredOrders}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onOrderClick={handleOrderClick}
              />

              {filteredOrders.length === 0 && (
                <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                  No orders found.
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {getPageNumbers().map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        handlePageChange(pageNumber)
                      }
                      className={`h-9 min-w-9 rounded-md border px-3 text-sm ${page === pageNumber
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <span className="px-2 text-sm text-slate-600 sm:hidden">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <OrderEditForm
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editingOrder}
        onSave={handleSave}
      />

      <OrderDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={viewingOrder}
      />
    </div>
  );
}