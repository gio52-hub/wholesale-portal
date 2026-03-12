"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import {
  Package,
  ExternalLink,
  DollarSign,
  Clock,
  ShoppingCart,
} from "lucide-react";
import OrderModal from "./order-modal";

interface ProductCardProps {
  product: Product;
  clientId: string;
}

export default function ProductCard({ product, clientId }: ProductCardProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const isAvailable = (product.unitsRemaining || product.unitsAvailable || 0) > 0;
  const unitsLeft = product.unitsRemaining || product.unitsAvailable || 0;
  const isLowStock = unitsLeft > 0 && unitsLeft < 50;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <CardContent className="pt-6">
          {/* Product Name */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-50 p-2.5 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {product.productName}
                </h3>
                {product.walmartLink && (
                  <a
                    href={product.walmartLink}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                Retail Price
              </div>
              <div className="text-xl font-bold text-gray-900">
                ${product.walmartRetailPrice?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500 text-xs mb-1">Units Available</div>
              <div className="text-lg font-semibold text-gray-900 flex items-center">
                {unitsLeft}
                {isLowStock && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Lead Time */}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1.5" />
            {product.leadTime || "Ready to Ship"}
          </div>

          {/* Internal Status Badge */}
          {product.internalStatus && (
            <div className="mt-3">
              <Badge 
                variant={product.internalStatus === "Purchased / In Stock" ? "default" : "secondary"}
                className="text-xs"
              >
                {product.internalStatus}
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t bg-gray-50 pt-4">
          <Button
            className="w-full bg-primary hover:bg-primary-600 text-white font-medium h-11"
            disabled={!isAvailable}
            onClick={() => setIsOrderModalOpen(true)}
          >
            {isAvailable ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Now
              </>
            ) : (
              "Sold Out"
            )}
          </Button>
        </CardFooter>
      </Card>

      <OrderModal
        product={product}
        clientId={clientId}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  );
}
