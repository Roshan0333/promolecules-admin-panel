"use client";

import { useState, useEffect, useMemo } from "react";
import OrderTable from "@/app/components/ui/OrderTable";
import OrderEditForm from "@/app/components/ui/OrderEditForm";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OrderDetailModal from "../OrderDetailModal/page";

const PAGE_SIZE = 10;

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit order
    const [formOpen, setFormOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    // View order details
    const [detailOpen, setDetailOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

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

    // Edit order
    function handleEditClick(order) {
        setEditingOrder(order);
        setFormOpen(true);
    }

    // View order details
    function handleOrderClick(order) {
        setViewingOrder(order);
        setDetailOpen(true);
    }

    // Delete order
    function handleDelete(id) {
        setOrders((prev) =>
            prev.filter((order) => order.id !== id)
        );
    }

    // Save edited order
    function handleSave(updatedOrder) {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === updatedOrder.id
                    ? updatedOrder
                    : order
            )
        );
    }

    // Only pending orders
    const filteredOrders = orders.filter((order) => {
        return order.status?.toLowerCase() === "pending";
    });

    // Reset page when orders change
    useEffect(() => {
        setCurrentPage(1);
    }, [orders.length]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / PAGE_SIZE)
    );

    const safePage = Math.min(
        currentPage,
        totalPages
    );

    const paginatedOrders = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;

        return filteredOrders.slice(
            start,
            start + PAGE_SIZE
        );
    }, [filteredOrders, safePage]);

    function goToPage(page) {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
    }

    return (
        <div className="w-full space-y-4 sm:space-y-5">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold sm:text-2xl">
                        In-Complete Orders
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage orders and order status.
                    </p>
                </div>

                <div className="text-xs text-slate-400 sm:ml-auto sm:text-sm">
                    Showing{" "}
                    {filteredOrders.length === 0
                        ? 0
                        : (safePage - 1) * PAGE_SIZE + 1}
                    –
                    {Math.min(
                        safePage * PAGE_SIZE,
                        filteredOrders.length
                    )}{" "}
                    of {filteredOrders.length} orders
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
                            orders={paginatedOrders}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            onOrderClick={handleOrderClick}
                        />

                    </div>

                    {/* Pagination */}
                    {filteredOrders.length > 0 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">

                            <button
                                onClick={() =>
                                    goToPage(
                                        safePage - 1
                                    )
                                }
                                disabled={safePage === 1}
                                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                            </button>

                            <div className="flex items-center gap-1">

                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, i) => i + 1
                                )
                                    .filter((page) => {
                                        return (
                                            page === 1 ||
                                            page === totalPages ||
                                            Math.abs(
                                                page -
                                                safePage
                                            ) <= 1
                                        );
                                    })
                                    .reduce(
                                        (
                                            acc,
                                            page,
                                            idx,
                                            arr
                                        ) => {
                                            if (
                                                idx > 0 &&
                                                page -
                                                arr[
                                                idx -
                                                1
                                                ] >
                                                1
                                            ) {
                                                acc.push(
                                                    "ellipsis-" +
                                                    page
                                                );
                                            }

                                            acc.push(page);

                                            return acc;
                                        },
                                        []
                                    )
                                    .map((page) =>
                                        typeof page ===
                                            "string" ? (
                                            <span
                                                key={page}
                                                className="px-2 text-sm text-slate-400"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    goToPage(
                                                        page
                                                    )
                                                }
                                                className={`h-8 w-8 rounded-md text-sm ${page ===
                                                        safePage
                                                        ? "bg-slate-900 text-white"
                                                        : "hover:bg-slate-50"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    )}

                            </div>

                            <button
                                onClick={() =>
                                    goToPage(
                                        safePage + 1
                                    )
                                }
                                disabled={
                                    safePage ===
                                    totalPages
                                }
                                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>

                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            <OrderEditForm
                open={formOpen}
                onOpenChange={setFormOpen}
                order={editingOrder}
                onSave={handleSave}
            />

            {/* Order Details Modal */}
            <OrderDetailModal
                open={detailOpen}
                onOpenChange={setDetailOpen}
                order={viewingOrder}
            />

        </div>
    );
}