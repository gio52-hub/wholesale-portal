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
import { ClipboardList, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ClaimHistory } from "@/types";

async function fetchClaimsHistory(): Promise<{ claims: ClaimHistory[]; error: string | null }> {
  try {
    const { getClaimsHistory } = await import("@/lib/airtable");
    const claims = await getClaimsHistory();
    return { claims: claims || [], error: null };
  } catch (e) {
    console.error("Error loading claims:", e);
    return { 
      claims: [], 
      error: "Failed to load claims history. Please check Airtable configuration." 
    };
  }
}

export default async function ClaimsPage() {
  const { claims, error } = await fetchClaimsHistory();

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

      {/* Error Message */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Note</p>
                <p className="text-sm">{error}</p>
                <p className="text-sm mt-1">
                  To track claims history, create a &quot;Claims History&quot; table in Airtable with the automation from the setup guide.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              {error ? "Unable to load claims" : "No claims recorded yet"}
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
                    <TableCell>${Number(claim.snapshotPrice || 0).toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      ${Number(claim.totalValue || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status || "Unknown")}</TableCell>
                    <TableCell className="text-gray-500">
                      {claim.claimTimestamp
                        ? (() => {
                            try {
                              const date = new Date(claim.claimTimestamp);
                              return isNaN(date.getTime()) ? "-" : format(date, "MMM d, yyyy HH:mm");
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
