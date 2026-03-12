import { getAllDeals } from "@/lib/airtable";
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
import { Handshake } from "lucide-react";
import { format } from "date-fns";

export default async function DealsPage() {
  const deals = await getAllDeals();

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case "Not Claimed":
        return <Badge variant="outline">Not Claimed</Badge>;
      case "Claimed":
        return <Badge className="bg-blue-500">Claimed</Badge>;
      case "Processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "Fulfilled":
        return <Badge className="bg-green-500">Fulfilled</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
            <span className="font-semibold text-primary">{deals.length}</span>{" "}
            deals
          </span>
        </div>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Client ROI</TableHead>
                <TableHead>Claimed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Claim Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-mono text-gray-500">
                    #{deal.dealId}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <span className="line-clamp-1">{deal.productName}</span>
                  </TableCell>
                  <TableCell>{deal.clientName}</TableCell>
                  <TableCell>
                    ${deal.lindaSellingPrice?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (deal.clientROI || 0) >= 0
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {deal.clientROI?.toFixed(1) || "0"}%
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
                      ? format(new Date(deal.claimDate), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
