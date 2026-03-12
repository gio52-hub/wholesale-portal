"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ClaimModal from "./claim-modal";
import { Deal } from "@/types";
import {
  Package,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Clock,
  ShoppingCart,
  Receipt,
} from "lucide-react";

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const isAvailable = (deal.unitsRemaining || 0) > 0;
  const isLowStock =
    (deal.unitsRemaining || 0) > 0 && (deal.unitsRemaining || 0) < 50;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <CardContent className="pt-6">
          {/* Product Name & Walmart Link */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-50 p-2.5 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {deal.productName}
                </h3>
                {deal.walmartLink && (
                  <a
                    href={deal.walmartLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center mt-1"
                  >
                    View on Walmart
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Walmart Retail Price - Highlighted */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-700 text-xs">
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                Walmart Retail Price
              </div>
              <div className="text-lg font-bold text-blue-700">
                ${deal.walmartRetailPrice?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Stats Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <DollarSign className="h-3 w-3 mr-0.5" />
                Your Cost
              </div>
              <div className="text-lg font-bold text-gray-900">
                ${deal.lindaSellingPrice?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <Receipt className="h-3 w-3 mr-0.5" />
                Est. Fees
              </div>
              <div className="text-lg font-bold text-gray-900">
                ${deal.walmartFees?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                Your ROI
              </div>
              <div
                className={`text-lg font-bold ${
                  (deal.clientROI || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {deal.clientROI?.toFixed(1) || "0"}%
              </div>
            </div>
          </div>

          {/* Profit & Units Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-700 text-xs mb-1">Profit / Unit</div>
              <div
                className={`text-xl font-bold ${
                  (deal.clientProfit || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${deal.clientProfit?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500 text-xs mb-1">Units Available</div>
              <div className="text-xl font-bold text-gray-900 flex items-center">
                {deal.unitsRemaining || 0}
                {isLowStock && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Low
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Lead Time */}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1.5" />
            {deal.leadTime || "Ready to Ship"}
          </div>
        </CardContent>

        <CardFooter className="border-t bg-gray-50 pt-4">
          <Button
            className="w-full bg-primary hover:bg-primary-600 text-white font-medium h-11"
            disabled={!isAvailable}
            onClick={() => setIsClaimModalOpen(true)}
          >
            {isAvailable ? "Claim Units" : "Sold Out"}
          </Button>
        </CardFooter>
      </Card>

      <ClaimModal
        deal={deal}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
    </>
  );
}
