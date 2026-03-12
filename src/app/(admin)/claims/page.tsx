import { getClaimsHistory } from "@/lib/airtable";
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
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";

export default async function ClaimsPage() {
  const claims = await getClaimsHistory();

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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
          <p className="text-gray-600 mt-1">View all claim records</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <ClipboardList className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">{claims.length}</span>{" "}
            claims
          </span>
        </div>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              No claims recorded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono text-gray-500">
                      #{claim.claimId}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <span className="line-clamp-1">{claim.productName}</span>
                    </TableCell>
                    <TableCell>{claim.clientName}</TableCell>
                    <TableCell>{claim.quantityClaimed}</TableCell>
                    <TableCell>${claim.snapshotPrice?.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      ${claim.totalValue?.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="text-gray-500">
                      {claim.claimTimestamp
                        ? format(
                            new Date(claim.claimTimestamp),
                            "MMM d, yyyy HH:mm"
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
