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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Handshake, 
  Search, 
  Filter,
  Package,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  List
} from "lucide-react";
import { format } from "date-fns";
import { Deal } from "@/types";

interface DealsTableProps {
  deals: Deal[];
}

type ViewType = "all" | "active" | "pending" | "fulfilled" | "by-client" | "by-product";

export default function DealsTable({ deals }: DealsTableProps) {
  const [view, setView] = useState<ViewType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  // Get unique clients and products for dropdowns
  // Handle cases where lookup fields might return arrays
  const clients = useMemo(() => {
    const clientNames = deals.map(d => {
      const name = d.clientName;
      if (Array.isArray(name)) return String(name[0] || '').trim();
      return String(name || '').trim();
    }).filter(Boolean);
    
    // Use object to deduplicate (handles any edge cases with Set)
    const uniqueMap: Record<string, boolean> = {};
    clientNames.forEach(name => { uniqueMap[name] = true; });
    return Object.keys(uniqueMap).sort();
  }, [deals]);

  const products = useMemo(() => {
    const productNames = deals.map(d => {
      const name = d.productName;
      if (Array.isArray(name)) return String(name[0] || '').trim();
      return String(name || '').trim();
    }).filter(Boolean);
    
    // Use object to deduplicate
    const uniqueMap: Record<string, boolean> = {};
    productNames.forEach(name => { uniqueMap[name] = true; });
    return Object.keys(uniqueMap).sort();
  }, [deals]);

  // Helper to normalize field values (handle arrays from lookup fields)
  const normalizeValue = (value: unknown): string => {
    if (Array.isArray(value)) return String(value[0] || '').trim();
    return String(value || '').trim();
  };

  // Filter deals based on view and search
  const filteredDeals = useMemo(() => {
    let result = deals;

    // Apply view filter
    switch (view) {
      case "active":
        result = result.filter(d => d.status === "Active" || !d.status);
        break;
      case "pending":
        result = result.filter(d => 
          d.claimStatus === "Submitted" || d.claimStatus === "Processing"
        );
        break;
      case "fulfilled":
        result = result.filter(d => d.claimStatus === "Fulfilled");
        break;
      case "by-client":
        if (selectedClient !== "all") {
          result = result.filter(d => normalizeValue(d.clientName) === selectedClient);
        }
        break;
      case "by-product":
        if (selectedProduct !== "all") {
          result = result.filter(d => normalizeValue(d.productName) === selectedProduct);
        }
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        normalizeValue(d.productName).toLowerCase().includes(term) ||
        normalizeValue(d.clientName).toLowerCase().includes(term) ||
        d.dealId?.toString().includes(term)
      );
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals, view, searchTerm, selectedClient, selectedProduct]);

  // Get counts for each view
  const counts = useMemo(() => ({
    all: deals.length,
    active: deals.filter(d => d.status === "Active" || !d.status).length,
    pending: deals.filter(d => d.claimStatus === "Submitted" || d.claimStatus === "Processing").length,
    fulfilled: deals.filter(d => d.claimStatus === "Fulfilled").length,
  }), [deals]);

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case "Not Claimed":
        return <Badge variant="outline">Not Claimed</Badge>;
      case "Submitted":
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case "Processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "Fulfilled":
        return <Badge className="bg-green-500">Fulfilled</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || "Not Claimed"}</Badge>;
    }
  };

  const viewButtons = [
    { id: "all" as ViewType, label: "All Deals", icon: List, count: counts.all },
    { id: "active" as ViewType, label: "Active", icon: AlertCircle, count: counts.active },
    { id: "pending" as ViewType, label: "Pending Claims", icon: Clock, count: counts.pending },
    { id: "fulfilled" as ViewType, label: "Fulfilled", icon: CheckCircle, count: counts.fulfilled },
    { id: "by-client" as ViewType, label: "By Client", icon: Users },
    { id: "by-product" as ViewType, label: "By Product", icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Deals</h1>
          <p className="text-gray-600 mt-1">View and manage all client deals</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Handshake className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">{filteredDeals.length}</span> of{" "}
            <span className="font-semibold">{deals.length}</span> deals
          </span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap gap-2">
        {viewButtons.map(({ id, label, icon: Icon, count }) => (
          <Button
            key={id}
            variant={view === id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setView(id);
              if (id !== "by-client") setSelectedClient("all");
              if (id !== "by-product") setSelectedProduct("all");
            }}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                view === id ? "bg-white/20" : "bg-gray-100"
              }`}>
                {count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Client Dropdown (shown in By Client view) */}
        {view === "by-client" && (
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Product Dropdown (shown in By Product view) */}
        {view === "by-product" && (
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map((product) => (
                <SelectItem key={product} value={product}>
                  <span className="line-clamp-1">{product}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filter indicator */}
        {(searchTerm || selectedClient !== "all" || selectedProduct !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedClient("all");
              setSelectedProduct("all");
            }}
            className="text-gray-500"
          >
            <Filter className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {view === "all" && "All Deals"}
              {view === "active" && "Active Deals"}
              {view === "pending" && "Pending Claims"}
              {view === "fulfilled" && "Fulfilled Orders"}
              {view === "by-client" && `Deals by Client${selectedClient !== "all" ? `: ${selectedClient}` : ""}`}
              {view === "by-product" && `Deals by Product${selectedProduct !== "all" ? `: ${selectedProduct}` : ""}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Handshake className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No deals found</p>
              {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Deal ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Client ROI</TableHead>
                    <TableHead>Snapshot Price</TableHead>
                    <TableHead>Client Profit</TableHead>
                    <TableHead>Units Remaining</TableHead>
                    <TableHead>Claimed Units</TableHead>
                    <TableHead>Claim Status</TableHead>
                    <TableHead>Claim Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-mono text-gray-500">
                        #{deal.dealId}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <span className="line-clamp-1" title={deal.productName}>
                          {deal.productName}
                        </span>
                      </TableCell>
                      <TableCell>{deal.clientName}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            (deal.snapshotClientROI || deal.clientROI || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(deal.snapshotClientROI || deal.clientROI || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        ${Number(deal.snapshotPrice || deal.walmartRetailPrice || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          (deal.snapshotClientProfit || deal.clientProfit || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          ${Number(deal.snapshotClientProfit || deal.clientProfit || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={deal.unitsRemaining <= 0 ? "text-red-500" : ""}>
                          {deal.unitsRemaining}
                        </span>
                      </TableCell>
                      <TableCell>
                        {deal.claimedUnits ? (
                          <span className="font-medium">{deal.claimedUnits}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getClaimStatusBadge(deal.claimStatus)}</TableCell>
                      <TableCell className="text-gray-500">
                        {deal.claimDate
                          ? (() => {
                              try {
                                return format(new Date(deal.claimDate), "MMM d, yyyy");
                              } catch {
                                return "-";
                              }
                            })()
                          : "-"}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{counts.all}</div>
            <p className="text-sm text-gray-500">Total Deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{counts.active}</div>
            <p className="text-sm text-gray-500">Active Deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
            <p className="text-sm text-gray-500">Pending Claims</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{counts.fulfilled}</div>
            <p className="text-sm text-gray-500">Fulfilled</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
