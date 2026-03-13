"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  Filter,
  List,
  FileQuestion,
  CheckCircle,
  PackageCheck,
  AlertTriangle,
  XCircle,
  ExternalLink,
  DollarSign
} from "lucide-react";
import { Product } from "@/types";

interface ProductsTableProps {
  products: Product[];
}

type ViewType = "all" | "proposed" | "confirmed" | "in-stock" | "available" | "low-stock" | "sold-out";

export default function ProductsTable({ products }: ProductsTableProps) {
  const [view, setView] = useState<ViewType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Helper to normalize field values
  const normalizeValue = (value: unknown): string => {
    if (Array.isArray(value)) return String(value[0] || '').trim();
    return String(value || '').trim();
  };

  // Filter products based on view and search
  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply view filter
    switch (view) {
      case "proposed":
        result = result.filter(p => 
          normalizeValue(p.internalStatus) === "Proposed / Potential" || 
          !p.internalStatus
        );
        break;
      case "confirmed":
        result = result.filter(p => normalizeValue(p.internalStatus) === "Confirmed");
        break;
      case "in-stock":
        result = result.filter(p => normalizeValue(p.internalStatus) === "Purchased / In stock");
        break;
      case "available":
        result = result.filter(p => normalizeValue(p.inventoryStatus) === "Available");
        break;
      case "low-stock":
        result = result.filter(p => normalizeValue(p.inventoryStatus) === "Low Stock");
        break;
      case "sold-out":
        result = result.filter(p => normalizeValue(p.inventoryStatus) === "Sold Out");
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        normalizeValue(p.productName).toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, view, searchTerm]);

  // Get counts for each view
  const counts = useMemo(() => ({
    all: products.length,
    proposed: products.filter(p => 
      normalizeValue(p.internalStatus) === "Proposed / Potential" || !p.internalStatus
    ).length,
    confirmed: products.filter(p => normalizeValue(p.internalStatus) === "Confirmed").length,
    inStock: products.filter(p => normalizeValue(p.internalStatus) === "Purchased / In stock").length,
    available: products.filter(p => normalizeValue(p.inventoryStatus) === "Available").length,
    lowStock: products.filter(p => normalizeValue(p.inventoryStatus) === "Low Stock").length,
    soldOut: products.filter(p => normalizeValue(p.inventoryStatus) === "Sold Out").length,
  }), [products]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalUnits = filteredProducts.reduce((sum, p) => sum + Number(p.unitsRemaining || 0), 0);
    const totalValue = filteredProducts.reduce((sum, p) => 
      sum + (Number(p.unitsRemaining || 0) * Number(p.lindaActualCost || 0)), 0
    );
    return { totalUnits, totalValue };
  }, [filteredProducts]);

  const getStatusBadge = (status: string) => {
    const s = normalizeValue(status);
    switch (s) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "Low Stock":
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case "Sold Out":
        return <Badge variant="destructive">Sold Out</Badge>;
      default:
        return <Badge variant="secondary">{s || "Unknown"}</Badge>;
    }
  };

  const getInternalStatusBadge = (status: string) => {
    const s = normalizeValue(status);
    switch (s) {
      case "Proposed / Potential":
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Proposed</Badge>;
      case "Confirmed":
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "Purchased / In stock":
        return <Badge className="bg-green-600">In Stock</Badge>;
      default:
        return <Badge variant="outline">Proposed</Badge>;
    }
  };

  const viewButtons = [
    { id: "all" as ViewType, label: "All Products", icon: List, count: counts.all },
    { id: "proposed" as ViewType, label: "Proposed", icon: FileQuestion, count: counts.proposed, color: "text-purple-600" },
    { id: "confirmed" as ViewType, label: "Confirmed", icon: CheckCircle, count: counts.confirmed, color: "text-blue-600" },
    { id: "in-stock" as ViewType, label: "In Stock", icon: PackageCheck, count: counts.inStock, color: "text-green-600" },
  ];

  const inventoryButtons = [
    { id: "available" as ViewType, label: "Available", icon: Package, count: counts.available },
    { id: "low-stock" as ViewType, label: "Low Stock", icon: AlertTriangle, count: counts.lowStock },
    { id: "sold-out" as ViewType, label: "Sold Out", icon: XCircle, count: counts.soldOut },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Package className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold">{products.length}</span> products
          </span>
        </div>
      </div>

      {/* Internal Status Tabs */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">By Internal Status</p>
        <div className="flex flex-wrap gap-2">
          {viewButtons.map(({ id, label, icon: Icon, count, color }) => (
            <Button
              key={id}
              variant={view === id ? "default" : "outline"}
              size="sm"
              onClick={() => setView(id)}
              className="flex items-center gap-2"
            >
              <Icon className={`h-4 w-4 ${view !== id && color ? color : ""}`} />
              {label}
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                view === id ? "bg-white/20" : "bg-gray-100"
              }`}>
                {count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Inventory Status Tabs */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">By Inventory Status</p>
        <div className="flex flex-wrap gap-2">
          {inventoryButtons.map(({ id, label, icon: Icon, count }) => (
            <Button
              key={id}
              variant={view === id ? "default" : "outline"}
              size="sm"
              onClick={() => setView(id)}
              className="flex items-center gap-2"
            >
              <Icon className={`h-4 w-4 ${
                id === "available" ? "text-green-600" : 
                id === "low-stock" ? "text-yellow-600" : 
                id === "sold-out" ? "text-red-600" : ""
              }`} />
              {label}
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                view === id ? "bg-white/20" : "bg-gray-100"
              }`}>
                {count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="text-gray-500"
          >
            <Filter className="h-4 w-4 mr-1" />
            Clear search
          </Button>
        )}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {view === "all" && "All Products"}
              {view === "proposed" && "Proposed / Potential Products"}
              {view === "confirmed" && "Confirmed Products"}
              {view === "in-stock" && "Purchased / In Stock Products"}
              {view === "available" && "Available Products"}
              {view === "low-stock" && "Low Stock Products"}
              {view === "sold-out" && "Sold Out Products"}
            </span>
            {filteredProducts.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                {totals.totalUnits.toLocaleString()} units · ${totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} value
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No products found</p>
              {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Product Name</TableHead>
                    <TableHead>Walmart Price</TableHead>
                    <TableHead>Your Cost</TableHead>
                    <TableHead>Walmart Fees</TableHead>
                    <TableHead>Units Available</TableHead>
                    <TableHead>Units Remaining</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Internal Status</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium max-w-[250px]">
                        <span className="line-clamp-2" title={product.productName}>
                          {product.productName}
                        </span>
                      </TableCell>
                      <TableCell>${Number(product.walmartRetailPrice || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(product.lindaActualCost || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(product.walmartFees || 0).toFixed(2)}</TableCell>
                      <TableCell>{product.unitsAvailable || 0}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          (product.unitsRemaining || 0) <= 0 ? "text-red-600" :
                          (product.unitsRemaining || 0) < 50 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {product.unitsRemaining || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.leadTime || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getInternalStatusBadge(product.internalStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.inventoryStatus)}
                      </TableCell>
                      <TableCell>
                        {product.walmartLink && (
                          <a
                            href={product.walmartLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 inline-flex items-center"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{counts.all}</div>
            <p className="text-sm text-gray-500">Total Products</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{counts.proposed}</div>
            <p className="text-sm text-gray-500">Proposed</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{counts.confirmed}</div>
            <p className="text-sm text-gray-500">Confirmed</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{counts.inStock}</div>
            <p className="text-sm text-gray-500">In Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{counts.available}</div>
            <p className="text-sm text-gray-500">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{counts.lowStock}</div>
            <p className="text-sm text-gray-500">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-1">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-xl font-bold text-green-600">
                {totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <p className="text-sm text-gray-500">Inventory Value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
