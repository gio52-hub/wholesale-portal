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
  ClipboardList, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  List,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { ClaimHistory } from "@/types";

interface ClaimsTableProps {
  claims: ClaimHistory[];
}

type ViewType = "all" | "submitted" | "processing" | "fulfilled" | "cancelled";

export default function ClaimsTable({ claims }: ClaimsTableProps) {
  const [view, setView] = useState<ViewType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("all");

  // Get unique clients for dropdown
  const clients = useMemo(() => {
    const clientNames = claims.map(c => {
      const name = c.clientName;
      if (Array.isArray(name)) return String(name[0] || '').trim();
      return String(name || '').trim();
    }).filter(Boolean);
    
    const uniqueMap: Record<string, boolean> = {};
    clientNames.forEach(name => { uniqueMap[name] = true; });
    return Object.keys(uniqueMap).sort();
  }, [claims]);

  // Filter claims based on view and search
  const filteredClaims = useMemo(() => {
    let result = claims;

    // Apply view filter
    switch (view) {
      case "submitted":
        result = result.filter(c => c.status === "Submitted");
        break;
      case "processing":
        result = result.filter(c => c.status === "Processing");
        break;
      case "fulfilled":
        result = result.filter(c => c.status === "Fulfilled");
        break;
      case "cancelled":
        result = result.filter(c => c.status === "Cancelled");
        break;
    }

    // Apply client filter
    if (selectedClient !== "all") {
      result = result.filter(c => {
        const name = Array.isArray(c.clientName) ? c.clientName[0] : c.clientName;
        return String(name || '').trim() === selectedClient;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => {
        const productName = Array.isArray(c.productName) ? c.productName[0] : c.productName;
        const clientName = Array.isArray(c.clientName) ? c.clientName[0] : c.clientName;
        return (
          String(productName || '').toLowerCase().includes(term) ||
          String(clientName || '').toLowerCase().includes(term) ||
          c.claimId?.toString().includes(term)
        );
      });
    }

    return result;
  }, [claims, view, searchTerm, selectedClient]);

  // Get counts for each view
  const counts = useMemo(() => ({
    all: claims.length,
    submitted: claims.filter(c => c.status === "Submitted").length,
    processing: claims.filter(c => c.status === "Processing").length,
    fulfilled: claims.filter(c => c.status === "Fulfilled").length,
    cancelled: claims.filter(c => c.status === "Cancelled").length,
  }), [claims]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalValue = filteredClaims.reduce((sum, c) => sum + Number(c.totalValue || 0), 0);
    const totalUnits = filteredClaims.reduce((sum, c) => sum + Number(c.quantityClaimed || 0), 0);
    return { totalValue, totalUnits };
  }, [filteredClaims]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case "Processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "Fulfilled":
        return <Badge className="bg-green-500">Fulfilled</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const viewButtons = [
    { id: "all" as ViewType, label: "All Claims", icon: List, count: counts.all },
    { id: "submitted" as ViewType, label: "Submitted", icon: Clock, count: counts.submitted },
    { id: "processing" as ViewType, label: "Processing", icon: Loader2, count: counts.processing },
    { id: "fulfilled" as ViewType, label: "Fulfilled", icon: CheckCircle, count: counts.fulfilled },
    { id: "cancelled" as ViewType, label: "Cancelled", icon: XCircle, count: counts.cancelled },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "-" : format(date, "MMM d, yyyy HH:mm");
    } catch {
      return "-";
    }
  };

  const getDisplayValue = (value: unknown): string => {
    if (Array.isArray(value)) return String(value[0] || '');
    return String(value || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
          <p className="text-gray-600 mt-1">View and manage all claim records</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <ClipboardList className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">{filteredClaims.length}</span> of{" "}
            <span className="font-semibold">{claims.length}</span> claims
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
            onClick={() => setView(id)}
            className="flex items-center gap-2"
          >
            <Icon className={`h-4 w-4 ${id === "processing" && view === id ? "animate-spin" : ""}`} />
            {label}
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              view === id ? "bg-white/20" : "bg-gray-100"
            }`}>
              {count}
            </span>
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Client Dropdown */}
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by client" />
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

        {/* Filter indicator */}
        {(searchTerm || selectedClient !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedClient("all");
            }}
            className="text-gray-500"
          >
            <Filter className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {view === "all" && "All Claims"}
              {view === "submitted" && "Submitted Claims"}
              {view === "processing" && "Processing Claims"}
              {view === "fulfilled" && "Fulfilled Claims"}
              {view === "cancelled" && "Cancelled Claims"}
            </span>
            {filteredClaims.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                Total: {totals.totalUnits} units · ${totals.totalValue.toFixed(2)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClaims.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No claims found</p>
              {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Snapshot Price</TableHead>
                    <TableHead>Client ROI</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Claim Date</TableHead>
                    <TableHead>Fulfillment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-gray-500">
                        #{claim.claimId}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <span className="line-clamp-1" title={getDisplayValue(claim.productName)}>
                          {getDisplayValue(claim.productName)}
                        </span>
                      </TableCell>
                      <TableCell>{getDisplayValue(claim.clientName)}</TableCell>
                      <TableCell className="font-medium">{claim.quantityClaimed}</TableCell>
                      <TableCell>${Number(claim.snapshotPrice || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          Number(claim.snapshotROI || 0) >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {Number(claim.snapshotROI || 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${Number(claim.totalValue || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(claim.claimTimestamp)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {claim.fulfillmentDate ? formatDate(claim.fulfillmentDate) : "-"}
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{counts.all}</div>
            <p className="text-sm text-gray-500">Total Claims</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{counts.submitted}</div>
            <p className="text-sm text-gray-500">Submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{counts.processing}</div>
            <p className="text-sm text-gray-500">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{counts.fulfilled}</div>
            <p className="text-sm text-gray-500">Fulfilled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-1">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-gray-500">Total Value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
