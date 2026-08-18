"use client";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import {
  Package,
  Truck,
  MapPin,
  User,
  CreditCard,
  FileText,
  ExternalLink,
  CalendarDays,
  Phone,
  Mail,
} from "lucide-react";

import axios from "axios";
import { useState } from "react";

/* -------------------------------------------------------
   PAYMENT COLORS
------------------------------------------------------- */

const paymentColors = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending:
    "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-700 border-yellow-200",

  confirmed:
    "bg-green-100 text-green-700 border-green-200",

  processing:
    "bg-blue-100 text-blue-700 border-blue-200",

  shipped:
    "bg-purple-100 text-purple-700 border-purple-200",

  dispatched:
    "bg-purple-100 text-purple-700 border-purple-200",

  delivered:
    "bg-green-100 text-green-700 border-green-200",

  cancelled:
    "bg-red-100 text-red-700 border-red-200",
};

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) {
    return "₹0";
  }

  return `₹${Number(amount).toLocaleString("en-IN")}`;
}


export default function OrderTable({
  orders,
  onEdit,
  onDelete,
  onOrderClick,
}) {

  const [serviceMode, setServiceMode] =
    useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paymentMode, setPaymentMode] =
    useState("");
  const [shipmentType, setShipmentType] =
    useState("");

  const [deliveryPathner, setDeliveryPathner] =
    useState([]);

  const [deliveryStatus, setDeliveyStatus] =
    useState(false);

  const [selectedDeliveryPartner, setSelectedDeliveryPartner] =
    useState(null);

  /* -----------------------------------------------------
     SELECTED ORDER
  ----------------------------------------------------- */

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [shipmentDetailsOpen, setShipmentDetailsOpen] =
    useState(false);

  const [shipmentDetails, setShipmentDetails] =
    useState(null);


  const [loading, setLoading] =
    useState(false);

  const [partnerLoading, setPartnerLoading] =
    useState(false);


  const resetShipmentData = () => {
    setServiceMode(false);

    setDeliveyStatus(false);

    setFrom("");
    setTo("");

    setPaymentMode("");
    setShipmentType("");

    setDeliveryPathner([]);

    setSelectedDeliveryPartner(null);

    setSelectedOrder(null);
     window.location.reload();
  };


  const handleViewShipmentDetails = (
    e,
    order
  ) => {
    e.stopPropagation();

    setShipmentDetails(order);

    setShipmentDetailsOpen(true);
  };



  const handleShipmentClick = (
    e,
    order
  ) => {
    e.stopPropagation();

    if (
      order.status === "pending" ||
      order.shipmentStatus === "cancelled"
    ) {
      return;
    }


    if (
      order.shipmentStatus ===
      "not_shipped"
    ) {
      setSelectedOrder(order);

      setServiceMode(true);

      return;
    }


    handleViewShipmentDetails(e, order);
  };



  const handleCreateVelocity =
    async () => {
      if (!selectedOrder) return;

      try {
        setLoading(true);

        const baseUrl =
          process.env
            .NEXT_PUBLIC_BASE_URL;

        const token =
          sessionStorage.getItem(
            "pm_admin_token"
          );

        const url = `${baseUrl}/api/velocity/serviceability`;

        const response =
          await axios.post(
            url,
            {
              from: from,
              to: to,
              payment_mode:
                paymentMode,
              shipment_type:
                shipmentType,
            },
            {
              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (response.data.success) {
          setDeliveryPathner(
            response.data.couriers ||
            []
          );

          setServiceMode(false);

          setDeliveyStatus(true);
        }
      } catch (err) {
        console.error(
          "Serviceability error:",
          err.response?.data ||
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

  const handleCancelShipment = async (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel shipment for order ${order.orderNumber || `#${order.id}`}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL;

      const token =
        sessionStorage.getItem("pm_admin_token");

      const url = `${baseUrl}/api/velocity/cancel/${order.id}`;

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(
        "Cancel shipment error:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseServiceDialog =
    (open) => {
      setServiceMode(open);

      if (!open) {
        setFrom("");
        setTo("");

        setPaymentMode("");
        setShipmentType("");

        setSelectedOrder(null);
      }
    };


  const handleClosePartnerDialog =
    (open) => {
      setDeliveyStatus(open);

      if (!open) {
        setDeliveryPathner([]);

        setSelectedDeliveryPartner(
          null
        );

        setFrom("");
        setTo("");

        setPaymentMode("");
        setShipmentType("");

        setSelectedOrder(null);
      }
    };

  const handleSelectDeliveryPartner =
    (partner) => {
      setSelectedDeliveryPartner(
        partner
      );
    };

  const handleConfirmDeliveryPartner =
    async () => {
      if (
        !selectedOrder ||
        !selectedDeliveryPartner
      ) {
        return;
      }

      try {
        setPartnerLoading(true);

        const baseUrl =
          process.env
            .NEXT_PUBLIC_BASE_URL;

        const token =
          sessionStorage.getItem(
            "pm_admin_token"
          );

        const carrierId =
          selectedDeliveryPartner.carrier_id;

        const carrierName =
          selectedDeliveryPartner.carrier_name;

        const expectedDeliveryDate =
          selectedDeliveryPartner.expected_delivery_date;

        console.log(
          "Carrier ID:",
          carrierId
        );

        console.log(
          "Carrier Name:",
          carrierName
        );

        console.log(
          "Expected Delivery:",
          expectedDeliveryDate
        );

        const url = `${baseUrl}/api/velocity/shipment/${selectedOrder.id}`;

        const response =
          await axios.post(
            url,
            {},
            {
              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (response.data.success) {
          resetShipmentData();
        
        }
      } catch (err) {
        console.error(
          "Create shipment error:",
          err.response?.data ||
          err.message
        );
      } finally {
        setPartnerLoading(false);
      }
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* =================================================
          ORDER TABLE
      ================================================= */}

      <Table className="min-w-[1400px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">
              Order
            </TableHead>

            <TableHead className="w-[15%]">
              Customer
            </TableHead>

            <TableHead className="w-[12%]">
              Items
            </TableHead>

            <TableHead className="w-[25%]">
              Shipping Address
            </TableHead>

            <TableHead className="w-[10%]">
              Amount
            </TableHead>

            <TableHead className="w-[10%]">
              Payment
            </TableHead>

            <TableHead className="w-[10%]">
              Status
            </TableHead>

            <TableHead className="w-[10%]">
              Ship Status
            </TableHead>

            <TableHead className="w-[10%]">
              Created
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* EMPTY */}
          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-10 text-center text-slate-400"
              >
                No orders found.
              </TableCell>
            </TableRow>
          )}

          {/* ORDERS */}
          {orders.map((o) => (
            <TableRow
              key={o.id}
              onClick={() =>
                onOrderClick(o)
              }
              className="cursor-pointer transition-colors hover:bg-slate-50"
            >
              {/* ---------------------------------------
                  ORDER
              ---------------------------------------- */}

              <TableCell>
                <div className="text-sm font-medium">
                  {o.orderNumber ||
                    `#${o.id}`}
                </div>

                <div className="text-xs text-slate-400">
                  ID: {o.id}
                </div>
              </TableCell>

              {/* ---------------------------------------
                  CUSTOMER
              ---------------------------------------- */}

              <TableCell>
                <div className="max-w-[200px] truncate text-sm font-medium">
                  {o.user?.name ||
                    o.shippingFullName ||
                    "-"}
                </div>

                <div className="max-w-[200px] break-all text-xs text-slate-400">
                  {o.user?.email || "-"}
                </div>

                <div className="text-xs text-slate-400">
                  {o.shippingMobile ||
                    "-"}
                </div>
              </TableCell>

              {/* ---------------------------------------
                  ITEMS
              ---------------------------------------- */}

              <TableCell>
                <div className="text-sm font-medium">
                  {o.items?.length || 0}{" "}
                  item
                  {(o.items?.length || 0) !==
                    1
                    ? "s"
                    : ""}
                </div>

                {o.items?.length > 0 && (
                  <div className="max-w-[150px] truncate text-xs text-slate-400">
                    {
                      o.items[0]
                        .productName
                    }

                    {o.items.length >
                      1 &&
                      ` + ${o.items.length - 1
                      } more`}
                  </div>
                )}
              </TableCell>

              {/* ---------------------------------------
                  SHIPPING ADDRESS
              ---------------------------------------- */}

              <TableCell>
                <div className="max-w-[320px] text-sm">
                  <div className="font-medium text-slate-900">
                    {o.shippingFullName ||
                      "-"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {o.shippingMobile ||
                      "-"}
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    {o.shippingAddressLine1 ||
                      "-"}
                  </div>

                  {o.shippingAddressLine2 && (
                    <div className="text-xs text-slate-600">
                      {
                        o.shippingAddressLine2
                      }
                    </div>
                  )}

                  {o.shippingLandmark && (
                    <div className="text-xs text-slate-500">
                      Landmark:{" "}
                      {
                        o.shippingLandmark
                      }
                    </div>
                  )}

                  <div className="text-xs text-slate-600">
                    {[
                      o.shippingCity,
                      o.shippingState,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>

                  <div className="text-xs text-slate-600">
                    {[
                      o.shippingCountry,
                      o.shippingPincode,
                    ]
                      .filter(Boolean)
                      .join(" - ")}
                  </div>

                  {o.shippingAddressType && (
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px]"
                    >
                      {
                        o.shippingAddressType
                      }
                    </Badge>
                  )}
                </div>
              </TableCell>

              {/* ---------------------------------------
                  AMOUNT
              ---------------------------------------- */}

              <TableCell>
                <div className="text-sm font-medium">
                  {formatAmount(
                    o.totalAmount
                  )}
                </div>

                {Number(
                  o.discountAmount
                ) > 0 && (
                    <div className="text-xs text-green-600">
                      -
                      {formatAmount(
                        o.discountAmount
                      )}
                    </div>
                  )}
              </TableCell>

              {/* ---------------------------------------
                  PAYMENT
              ---------------------------------------- */}

              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    paymentColors[
                    o.paymentStatus
                    ] ||
                    "bg-slate-100 text-slate-700"
                  }
                >
                  {o.paymentStatus ||
                    "-"}
                </Badge>

                <div className="mt-1 text-xs text-slate-400">
                  {o.paymentMethod ||
                    "-"}
                </div>
              </TableCell>

              {/* ---------------------------------------
                  STATUS
              ---------------------------------------- */}

              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    statusColors[
                    o.status
                    ] ||
                    "bg-slate-100 text-slate-700"
                  }
                >
                  {o.status || "-"}
                </Badge>
              </TableCell>


              <TableCell>
                {o.status === "pending" ? (
                  <Badge
                    variant="outline"
                    className="cursor-default border-slate-200 bg-slate-100 text-slate-500"
                  >
                    -
                  </Badge>
                ) : o.shipmentStatus === "not_shipped" ? (
                  <Badge
                    variant="outline"
                    onClick={(e) => handleShipmentClick(e, o)}
                    className="cursor-pointer border-green-300 bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Ship Now
                  </Badge>
                ) : o.shipmentStatus === "cancelled" ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      onClick={(e) => handleViewShipmentDetails(e, o)}
                      className="cursor-pointer border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      View Details
                    </Badge>

                    <Badge
                      variant="outline"
                      className="cursor-default border-slate-300 bg-slate-100 text-slate-500"
                    >
                      Cancelled
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      onClick={(e) => handleViewShipmentDetails(e, o)}
                      className="cursor-pointer border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      View Details
                    </Badge>

                    <Badge
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelShipment(o);
                      }}
                      className="cursor-pointer border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Cancel Ship
                    </Badge>
                  </div>
                )}
              </TableCell>

              <TableCell className="whitespace-nowrap text-sm">
                {formatDate(
                  o.createdAt
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={serviceMode}
        onOpenChange={
          handleCloseServiceDialog
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Create Shipment
            </DialogTitle>

            <DialogDescription>
              Enter shipment details for{" "}
              <span className="font-medium text-slate-900">
                {selectedOrder?.orderNumber ||
                  `#${selectedOrder?.id}`}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* FROM */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                From Pincode
              </label>

              <Input
                placeholder="Enter pickup pincode"
                value={from}
                onChange={(e) =>
                  setFrom(
                    e.target.value
                  )
                }
              />
            </div>

            {/* TO */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                To Pincode
              </label>

              <Input
                placeholder="Enter delivery pincode"
                value={to}
                onChange={(e) =>
                  setTo(
                    e.target.value
                  )
                }
              />
            </div>

            {/* PAYMENT MODE */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Payment Mode
              </label>

              <Select
                value={paymentMode}
                onValueChange={
                  setPaymentMode
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Prepaid">
                    Prepaid
                  </SelectItem>

                  <SelectItem value="COD">
                    COD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SHIPMENT TYPE */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Shipment Type
              </label>

              <Select
                value={shipmentType}
                onValueChange={
                  setShipmentType
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipment type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Forward">
                    Forward
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handleCloseServiceDialog(
                    false
                  )
                }
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  loading ||
                  !from ||
                  !to ||
                  !paymentMode ||
                  !shipmentType
                }
                onClick={
                  handleCreateVelocity
                }
              >
                {loading
                  ? "Checking..."
                  : "Check Availability"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deliveryStatus}
        onOpenChange={
          handleClosePartnerDialog
        }
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Select Delivery Partner
            </DialogTitle>

            <DialogDescription>
              Select a delivery partner for{" "}
              <span className="font-medium text-slate-900">
                {selectedOrder?.orderNumber ||
                  `#${selectedOrder?.id}`}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[450px] space-y-3 overflow-y-auto pr-1">
            {deliveryPathner.length ===
              0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-slate-500">
                  No delivery partners
                  available.
                </p>
              </div>
            ) : (
              deliveryPathner.map(
                (partner) => {
                  const isSelected =
                    selectedDeliveryPartner?.carrier_id ===
                    partner.carrier_id;

                  return (
                    <div
                      key={
                        partner.carrier_id
                      }
                      onClick={(e) => {
                        e.stopPropagation();

                        handleSelectDeliveryPartner(
                          partner
                        );
                      }}
                      className={`cursor-pointer rounded-lg border p-4 transition ${isSelected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900">
                            {
                              partner.carrier_name
                            }
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            Carrier ID:{" "}
                            {
                              partner.carrier_id
                            }
                          </div>

                          <div className="mt-2 text-sm text-slate-600">
                            Expected
                            Delivery:{" "}
                            <span className="font-medium">
                              {formatDate(
                                partner.expected_delivery_date
                              )}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleClosePartnerDialog(
                  false
                )
              }
              disabled={partnerLoading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                !selectedDeliveryPartner ||
                partnerLoading
              }
              onClick={
                handleConfirmDeliveryPartner
              }
            >
              {partnerLoading
                ? "Creating..."
                : "Create Shipment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={shipmentDetailsOpen}
        onOpenChange={(open) => {
          setShipmentDetailsOpen(
            open
          );

          if (!open) {
            setShipmentDetails(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[750px]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5" />

                  Shipment Details
                </DialogTitle>

                <DialogDescription className="mt-1">
                  Shipment information for{" "}
                  <span className="font-medium text-slate-900">
                    {shipmentDetails?.orderNumber ||
                      "-"}
                  </span>
                </DialogDescription>
              </div>

              {shipmentDetails?.shipmentStatus && (
                <Badge
                  variant="outline"
                  className={
                    shipmentDetails.shipmentStatus ===
                      "cancelled"
                      ? "border-red-200 bg-red-100 text-red-700"
                      : "border-green-200 bg-green-100 text-green-700"
                  }
                >
                  {shipmentDetails.shipmentStatus}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {shipmentDetails && (
            <div className="space-y-6 pt-2">
              {/* -----------------------------------------
                  SHIPMENT INFORMATION
              ------------------------------------------ */}

              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Shipment Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* COURIER */}

                  <div>
                    <p className="text-xs text-slate-500">
                      Courier Partner
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {shipmentDetails.courierName ||
                        "-"}
                    </p>
                  </div>

                  {/* AWB */}

                  <div>
                    <p className="text-xs text-slate-500">
                      AWB Number
                    </p>

                    <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                      {shipmentDetails.awbCode ||
                        "-"}
                    </p>
                  </div>

                  {/* VELOCITY ORDER */}

                  <div>
                    <p className="text-xs text-slate-500">
                      Velocity Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-slate-900">
                      {shipmentDetails.velocityOrderId ||
                        "-"}
                    </p>
                  </div>

                  {/* VELOCITY SHIPMENT */}

                  <div>
                    <p className="text-xs text-slate-500">
                      Velocity Shipment ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-slate-900">
                      {shipmentDetails.velocityShipmentId ||
                        "-"}
                    </p>
                  </div>

                  {/* CREATED */}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Created
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-900">
                      {formatDateTime(
                        shipmentDetails.createdAt
                      )}
                    </p>
                  </div>

                  {/* UPDATED */}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Last Updated
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-900">
                      {formatDateTime(
                        shipmentDetails.updatedAt
                      )}
                    </p>
                  </div>
                </div>

                {/* SHIPPING LABEL */}

                {shipmentDetails.labelUrl && (
                  <div className="mt-4 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        window.open(
                          shipmentDetails.labelUrl,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />

                      View Shipping Label

                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* -----------------------------------------
                  CUSTOMER
              ------------------------------------------ */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Customer Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-2">
                  {/* NAME */}

                  <div>
                    <p className="text-xs text-slate-500">
                      Customer Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {shipmentDetails.user?.name ||
                        shipmentDetails.shippingFullName ||
                        "-"}
                    </p>
                  </div>

                  {/* CUSTOMER ID */}

                  <div>
                    <p className="text-xs text-slate-500">
                      Customer ID
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {shipmentDetails.userId ||
                        "-"}
                    </p>
                  </div>

                  {/* EMAIL */}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Email
                      </p>
                    </div>

                    <p className="mt-1 break-all text-sm text-slate-900">
                      {shipmentDetails.user?.email ||
                        shipmentDetails.address?.email ||
                        "-"}
                    </p>
                  </div>

                  {/* MOBILE */}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />

                      <p className="text-xs text-slate-500">
                        Mobile
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-slate-900">
                      {shipmentDetails.shippingMobile ||
                        shipmentDetails.address?.mobile ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* -----------------------------------------
                  SHIPPING ADDRESS
              ------------------------------------------ */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Shipping Address
                  </h3>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {shipmentDetails.shippingFullName ||
                          shipmentDetails.address?.fullName ||
                          "-"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {shipmentDetails.shippingMobile ||
                          shipmentDetails.address?.mobile ||
                          "-"}
                      </p>
                    </div>

                    {shipmentDetails.shippingAddressType && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {
                          shipmentDetails.shippingAddressType
                        }
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    {shipmentDetails.shippingAddressLine1 && (
                      <p>
                        {
                          shipmentDetails.shippingAddressLine1
                        }
                      </p>
                    )}

                    {shipmentDetails.shippingAddressLine2 && (
                      <p>
                        {
                          shipmentDetails.shippingAddressLine2
                        }
                      </p>
                    )}

                    {shipmentDetails.shippingLandmark && (
                      <p>
                        Landmark:{" "}
                        {
                          shipmentDetails.shippingLandmark
                        }
                      </p>
                    )}

                    <p>
                      {[
                        shipmentDetails.shippingCity,
                        shipmentDetails.shippingState,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <p>
                      {[
                        shipmentDetails.shippingCountry,
                        shipmentDetails.shippingPincode,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* -----------------------------------------
                  ORDER ITEMS
              ------------------------------------------ */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h3>
                </div>

                <div className="overflow-hidden rounded-xl border">
                  {shipmentDetails.items
                    ?.length > 0 ? (
                    <div className="divide-y">
                      {shipmentDetails.items.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 p-4"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {item.productName ||
                                  "-"}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                                {item.flavour && (
                                  <span>
                                    Flavour:{" "}
                                    {
                                      item.flavour
                                    }
                                  </span>
                                )}

                                {item.size && (
                                  <span>
                                    Size:{" "}
                                    {
                                      item.size
                                    }
                                  </span>
                                )}

                                <span>
                                  Qty:{" "}
                                  {item.quantity ||
                                    0}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatAmount(
                                  item.priceAtPurchase
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                per item
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No items found.
                    </div>
                  )}
                </div>
              </div>

              {/* -----------------------------------------
                  ORDER + PAYMENT
              ------------------------------------------ */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-600" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Order & Payment
                  </h3>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {/* ORDER NUMBER */}

                    <div>
                      <p className="text-xs text-slate-500">
                        Order Number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-900">
                        {shipmentDetails.orderNumber ||
                          "-"}
                      </p>
                    </div>

                    {/* PAYMENT METHOD */}

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {shipmentDetails.paymentMethod ||
                          "-"}
                      </p>
                    </div>

                    {/* PAYMENT STATUS */}

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment Status
                      </p>

                      <Badge
                        variant="outline"
                        className={`mt-1 ${paymentColors[
                          shipmentDetails
                            .paymentStatus
                        ] ||
                          "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {shipmentDetails.paymentStatus ||
                          "-"}
                      </Badge>
                    </div>

                    {/* ORDER STATUS */}

                    <div>
                      <p className="text-xs text-slate-500">
                        Order Status
                      </p>

                      <Badge
                        variant="outline"
                        className={`mt-1 ${statusColors[
                          shipmentDetails
                            .status
                        ] ||
                          "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {shipmentDetails.status ||
                          "-"}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* AMOUNTS */}

                  <div className="space-y-2">
                    {/* SUBTOTAL */}

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-medium">
                        {formatAmount(
                          shipmentDetails.subtotal
                        )}
                      </span>
                    </div>

                    {/* SHIPPING */}

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Shipping
                      </span>

                      <span className="font-medium">
                        {formatAmount(
                          shipmentDetails.shippingCost
                        )}
                      </span>
                    </div>

                    {/* DISCOUNT */}

                    {Number(
                      shipmentDetails.discountAmount
                    ) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">
                            Discount
                          </span>

                          <span className="font-medium text-green-600">
                            -
                            {formatAmount(
                              shipmentDetails.discountAmount
                            )}
                          </span>
                        </div>
                      )}

                    {/* COUPON */}

                    {shipmentDetails.couponCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Coupon
                        </span>

                        <span className="font-medium text-slate-900">
                          {
                            shipmentDetails.couponCode
                          }
                        </span>
                      </div>
                    )}

                    <Separator />

                    {/* TOTAL */}

                    <div className="flex justify-between pt-1">
                      <span className="font-semibold text-slate-900">
                        Total Amount
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        {formatAmount(
                          shipmentDetails.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* -----------------------------------------
                  RAZORPAY
              ------------------------------------------ */}

              {(shipmentDetails.razorpayOrderId ||
                shipmentDetails.razorpayPaymentId) && (
                  <div className="rounded-xl border bg-slate-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Payment Reference
                    </h3>

                    <div className="space-y-3 text-xs">
                      {/* RAZORPAY ORDER */}

                      {shipmentDetails.razorpayOrderId && (
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                          <span className="text-slate-500">
                            Razorpay Order ID
                          </span>

                          <span className="break-all font-mono text-slate-700">
                            {
                              shipmentDetails.razorpayOrderId
                            }
                          </span>
                        </div>
                      )}

                      {/* RAZORPAY PAYMENT */}

                      {shipmentDetails.razorpayPaymentId && (
                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                          <span className="text-slate-500">
                            Razorpay Payment ID
                          </span>

                          <span className="break-all font-mono text-slate-700">
                            {
                              shipmentDetails.razorpayPaymentId
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* -----------------------------------------
                  FOOTER
              ------------------------------------------ */}

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShipmentDetailsOpen(
                      false
                    )
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}