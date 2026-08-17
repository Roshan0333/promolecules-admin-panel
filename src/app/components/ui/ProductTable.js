"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { Pencil, Trash2 } from "lucide-react";

// Price / discount / stock are stored per variant.
// This summarizes the variant information for the table.
function getVariantStats(product) {
  const variants = product.variants || [];

  const prices = variants
    .map((v) => parseFloat(v.price))
    .filter((n) => !Number.isNaN(n));

  // If discountedPrice is null, use regular price.
  const discounted = variants
    .map((v) => {
      const discountPrice = parseFloat(v.discountedPrice);

      if (!Number.isNaN(discountPrice)) {
        return discountPrice;
      }

      const regularPrice = parseFloat(v.price);

      return !Number.isNaN(regularPrice)
        ? regularPrice
        : null;
    })
    .filter((n) => n !== null);

  const totalStock = variants.reduce(
    (sum, v) =>
      sum + (Number(v.stockQuantity) || 0),
    0
  );

  return {
    minPrice: prices.length
      ? Math.min(...prices)
      : null,

    minDiscounted: discounted.length
      ? Math.min(...discounted)
      : null,

    maxDiscounted: discounted.length
      ? Math.max(...discounted)
      : null,

    totalStock,

    variantCount: variants.length,
  };
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[950px] w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">
              Product
            </TableHead>

            <TableHead className="w-[15%]">
              Price
            </TableHead>

            <TableHead className="w-[14%]">
              Stock
            </TableHead>

            <TableHead className="w-[13%]">
              SKU
            </TableHead>

            <TableHead className="w-[12%]">
              Created
            </TableHead>

            <TableHead className="w-[9%]">
              Status
            </TableHead>

            <TableHead className="w-[7%] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Empty state */}
          {products.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-slate-400"
              >
                No products yet.
              </TableCell>
            </TableRow>
          )}

          {products.map((p) => {
            const stats = getVariantStats(p);

            return (
              <TableRow key={p.id}>
                {/* PRODUCT */}
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        bg-slate-100
                        text-xs
                        text-slate-500
                      "
                    >
                      {p.id}
                    </div>

                    <span
                      className="
                        min-w-0
                        break-words
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      {p.name}
                    </span>
                  </div>
                </TableCell>

                {/* PRICE */}
                <TableCell>
                  {stats.minDiscounted != null ? (
                    <div className="text-sm">
                      <span className="font-medium">
                        ₹{stats.minDiscounted}
                      </span>

                      {stats.minDiscounted !==
                        stats.maxDiscounted && (
                        <span className="text-slate-600">
                          {" "}
                          – ₹{stats.maxDiscounted}
                        </span>
                      )}

                      {stats.minPrice != null &&
                        stats.minPrice >
                          stats.minDiscounted && (
                          <span
                            className="
                              ml-1.5
                              text-slate-400
                              line-through
                            "
                          >
                            ₹{stats.minPrice}
                          </span>
                        )}
                    </div>
                  ) : stats.minPrice != null ? (
                    <span className="text-sm font-medium">
                      ₹{stats.minPrice}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">
                      —
                    </span>
                  )}
                </TableCell>

                {/* STOCK */}
                <TableCell>
                  {stats.variantCount === 0 ? (
                    <span className="text-sm text-slate-400">
                      —
                    </span>
                  ) : stats.totalStock > 0 ? (
                    <span className="text-sm font-medium text-green-600">
                      In stock ({stats.totalStock})
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-500">
                      Out of stock
                    </span>
                  )}
                </TableCell>

                {/* SKU */}
                <TableCell>
                  <span className="break-all text-sm">
                    {p.sku || "—"}
                  </span>
                </TableCell>

                {/* CREATED */}
                <TableCell>
                  <span className="whitespace-nowrap text-sm text-slate-600">
                    {p.createdAt
                      ? p.createdAt.slice(0, 10)
                      : "—"}
                  </span>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <Badge
                    variant={
                      p.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {p.status || "unknown"}
                  </Badge>
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(p)}
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2
                        size={16}
                        className="text-red-500"
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}