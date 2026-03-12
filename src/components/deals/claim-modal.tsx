"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Deal } from "@/types";
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ClaimModalProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimModal({ deal, isOpen, onClose }: ClaimModalProps) {
  const router = useRouter();
  const [units, setUnits] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const maxUnits = deal.unitsRemaining || 0;
  const unitsNum = parseInt(units) || 0;
  const totalCost = unitsNum * (deal.lindaSellingPrice || 0);
  const totalProfit = unitsNum * (deal.clientProfit || 0);

  const handleSubmit = async () => {
    if (unitsNum <= 0) {
      setError("Please enter a valid number of units");
      return;
    }
    if (unitsNum > maxUnits) {
      setError(`Maximum ${maxUnits} units available`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/deals/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id,
          claimedUnits: unitsNum,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to claim");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setUnits("");
        router.refresh();
      }, 1500);
    } catch {
      setError("Failed to submit claim. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUnits("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Claim Units</span>
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">
              Claim Submitted!
            </h3>
            <p className="text-gray-500 mt-1">
              Your order has been placed successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                  {deal.productName}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-400" />$
                    {deal.lindaSellingPrice?.toFixed(2)} / unit
                  </div>
                  <div
                    className={`flex items-center ${
                      (deal.clientROI || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {deal.clientROI?.toFixed(1)}% ROI
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3 pt-3 border-t">
                  <span className="font-medium">{maxUnits}</span> units available
                </p>
              </div>

              {/* Units Input */}
              <div className="space-y-2">
                <Label htmlFor="units" className="text-gray-700">
                  Units to Claim
                </Label>
                <Input
                  id="units"
                  type="number"
                  min="1"
                  max={maxUnits}
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder={`Enter quantity (max ${maxUnits})`}
                  className="h-11"
                />
              </div>

              {/* Summary */}
              {unitsNum > 0 && unitsNum <= maxUnits && (
                <div className="bg-primary-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-semibold text-gray-900">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Est. Profit:</span>
                    <span
                      className={`font-semibold ${
                        totalProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${totalProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary-600"
                onClick={handleSubmit}
                disabled={isLoading || unitsNum <= 0 || unitsNum > maxUnits}
              >
                {isLoading ? "Submitting..." : "Confirm Claim"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
