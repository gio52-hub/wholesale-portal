import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDealsForClient } from "@/lib/airtable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { format } from "date-fns";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId;

  const deals = clientId ? await getDealsForClient(clientId) : [];

  const orders = deals.filter(
    (deal) => deal.claimStatus && deal.claimStatus !== "Not Claimed"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Claimed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Claimed</Badge>;
      case "Processing":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Processing</Badge>
        );
      case "Fulfilled":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Fulfilled</Badge>
        );
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track your claimed orders</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <ShoppingCart className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">{orders.length}</span>{" "}
            orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="text-gray-500 mt-1">
            Claim some deals to see them here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Price / Unit</TableHead>
                <TableHead className="font-semibold">ROI</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Claim Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium max-w-xs">
                    <span className="line-clamp-2">{order.productName}</span>
                  </TableCell>
                  <TableCell>{order.claimedUnits}</TableCell>
                  <TableCell>
                    $
                    {order.snapshotPrice?.toFixed(2) ||
                      order.lindaSellingPrice?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (order.snapshotClientROI || order.clientROI || 0) >= 0
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {(
                        order.snapshotClientROI ||
                        order.clientROI ||
                        0
                      ).toFixed(1)}
                      %
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.claimStatus)}</TableCell>
                  <TableCell className="text-gray-500">
                    {order.claimDate
                      ? format(new Date(order.claimDate), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
