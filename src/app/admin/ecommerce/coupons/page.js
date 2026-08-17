"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import CouponTable from "@/app/components/ui/CouponTable";
import CouponForm from "@/app/components/ui/CouponForm";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/coupons`;
const changeAPIUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/coupons/`;

function getToken() {
  return sessionStorage.getItem("pm_admin_token");
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!res.ok) {
          throw new Error(
            `Request failed with status ${res.status}`
          );
        }

        const data = await res.json();

        console.log("Fetched coupons:", data);

        setCoupons(data.coupons || []);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupons();
  }, []);

  function handleAddClick() {
    setEditingCoupon(null);
    setFormOpen(true);
  }

  function handleEditClick(coupon) {
    setEditingCoupon(coupon);
    setFormOpen(true);
  }

  function handleDelete(coupon) {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!couponToDelete?.id) return;

    setDeleting(true);

    try {
      console.log(
        "Attempting to delete coupon with ID:",
        couponToDelete.id
      );

      const res = await fetch(
        changeAPIUrl + couponToDelete.id,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            id: couponToDelete.id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Deletion failed with status ${res.status}`
        );
      }

      setCoupons((prev) =>
        prev.filter(
          (c) => c.id !== couponToDelete.id
        )
      );

      toast.success("Coupon deleted successfully!");

      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    } catch (err) {
      toast.error(
        `Failed to delete coupon: ${err.message}`
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave(coupon) {
    // Editing existing coupon
    if (coupon.id) {
      try {
        const res = await fetch(
          changeAPIUrl + coupon.id,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(coupon),
          }
        );

        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => null);

          throw new Error(
            errData?.message ||
              `Request failed with status ${res.status}`
          );
        }

        await res.json();

        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id
              ? { ...c, ...coupon }
              : c
          )
        );

        toast.success(
          "Coupon updated successfully!"
        );

        return;
      } catch (err) {
        console.error(
          "Update coupon failed:",
          err
        );

        toast.error(
          `Failed to update coupon: ${err.message}`
        );

        return;
      }
    }

    // Creating a new coupon
    try {
      const res = await fetch(changeAPIUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(coupon),
      });

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => null);

        throw new Error(
          errData?.message ||
            `Request failed with status ${res.status}`
        );
      }

      const data = await res.json();

      const created = data.coupon || data;

      setCoupons((prev) => [
        created,
        ...prev,
      ]);

      toast.success(
        "Coupon created successfully!"
      );
    } catch (err) {
      console.error(
        "Create coupon failed:",
        err
      );

      toast.error(
        `Failed to create coupon: ${err.message}`
      );
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="w-full space-y-4 sm:space-y-5">
        <div
          className="
            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <Skeleton className="h-8 w-44" />

          <Skeleton
            className="
              h-10
              w-full
              rounded-md

              sm:w-36
            "
          />
        </div>

        <div className="w-full overflow-hidden rounded-lg border bg-white">
          <div className="w-full overflow-x-auto">
            <TableSkeleton
              rows={6}
              columns={8}
            />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="w-full">
        <p className="text-red-500">
          Failed to load coupons: {error}
        </p>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <h1 className="text-xl font-semibold">
          Coupons
        </h1>

        <Button
          onClick={handleAddClick}
          className="w-full sm:w-auto"
        >
          <Plus
            size={16}
            className="mr-1"
          />

          Add Coupon
        </Button>
      </div>

      {/* TABLE */}

      <div
        className="
          w-full
          overflow-hidden
          rounded-lg
          border
          bg-white
        "
      >
        <div className="w-full overflow-x-auto">
          <CouponTable
            coupons={coupons}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* FORM */}

      <CouponForm
        open={formOpen}
        onOpenChange={setFormOpen}
        coupon={editingCoupon}
        onSave={handleSave}
      />

      {/* DELETE */}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Coupon"
        description={
          couponToDelete
            ? `Are you sure you want to delete "${couponToDelete.code}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}