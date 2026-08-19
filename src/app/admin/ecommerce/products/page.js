"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import ProductTable from "@/app/components/ui/ProductTable";
import ProductForm from "@/app/components/ui/ProductForm";
import DeleteConfirmDialog from "@/app/components/ui/DeleteConfirmDialog";
import TableSkeleton from "@/app/components/ui/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}dashboard/all`,
          {
            headers:{
              "Content-Type":"application/json",
              "Authorization":`Bearer ${sessionStorage.getItem("pm_admin_token")}`
            }
          }
        );

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  function handleAddClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEditClick(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleDelete(product) {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!productToDelete?.id) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);

        throw new Error(
          errData?.message ||
            `Deletion failed with status ${res.status}`
        );
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== productToDelete.id)
      );

      toast.success("Product deleted successfully!");

      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Delete product failed:", err);

      toast.error(`Failed to delete product: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave(product) {
    if (product.id) {
      const {
        id,
        createdAt,
        updatedAt,
        category,
        reviews,
        variants,
        servings,
        faqs,
        ...scalarFields
      } = product;

      const bodyWithoutId = {
        ...scalarFields,
        categoryId: Number(scalarFields.categoryId),

        ...(variants ? { variants } : {}),
        ...(servings ? { servings } : {}),
        ...(faqs ? { faqs } : {}),
      };

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyWithoutId),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);

          throw new Error(
            errData?.message ||
              `Request failed with status ${res.status}`
          );
        }

        const data = await res.json();
        const updated = data.product || data;

        setProducts((prev) =>
          prev.map((p) =>
            p.id === updated.id ? updated : p
          )
        );

        toast.success("Product updated successfully!");
      } catch (err) {
        console.error("Update product failed:", err);

        toast.error(
          `Failed to update product: ${err.message}`
        );
      }

      return;
    }

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);

        throw new Error(
          errData?.message ||
            `Request failed with status ${res.status}`
        );
      }

      const data = await res.json();
      const created = data.product || data;

      setProducts((prev) => [created, ...prev]);

      toast.success("Product created successfully!");
    } catch (err) {
      console.error("Create product failed:", err);

      toast.error(
        `Failed to create product: ${err.message}`
      );
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-44" />

          <Skeleton className="h-10 w-full rounded-md sm:w-36" />
        </div>

        <TableSkeleton rows={6} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load products: {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products and inventory.
          </p>
        </div>

        <Button
          onClick={handleAddClick}
          className="w-full sm:w-auto"
        >
          <Plus size={16} className="mr-1" />
          Add Product
        </Button>
      </div>

      {/* Product Table */}
      <div className="w-full overflow-hidden rounded-lg border bg-white">
        <div className="w-full overflow-x-auto">
          <ProductTable
            products={products}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}