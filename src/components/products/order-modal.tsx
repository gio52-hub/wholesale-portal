"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";
import { Package, AlertCircle, CheckCircle } from "lucide-react";

interface OrderModalProps {
  product: Product;
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({
  product,
  clientId,
  isOpen,
  onClose,
}: OrderModalProps) {
  const router = useRouter();
  const [units, setUnits] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const maxUnits = product.unitsRemaining || product.unitsAvailable || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (units < 1) {
      setError("Please enter at least 1 unit");
      return;
    }

    if (units > maxUnits) {
      setError(`Only ${maxUnits} units available`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          clientId: clientId,
          units: units,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to place order");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setUnits(1);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError("");
      setSuccess(false);
      setUnits(1);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Place Order
          </DialogTitle>
          <DialogDescription>
            Order units of {product.productName}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order Placed Successfully!
            </h3>
            <p className="text-gray-500 mt-1">
              You ordered {units} units of {product.productName}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Product</div>
              <div className="font-semibold text-gray-900">
                {product.productName}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Retail Price: ${product.walmartRetailPrice?.toFixed(2)}
              </div>
            </div>

            {/* Units Input */}
            <div className="space-y-2">
              <Label htmlFor="units">
                Number of Units (Max: {maxUnits})
              </Label>
              <Input
                id="units"
                type="number"
                min={1}
                max={maxUnits}
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                className="text-lg"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary-600"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
