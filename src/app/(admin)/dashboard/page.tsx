import { getAllDeals, getProducts, getClients } from "@/lib/airtable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const [deals, products, clients] = await Promise.all([
    getAllDeals(),
    getProducts(),
    getClients(),
  ]);

  const pendingClaims = deals.filter((d) => d.claimStatus === "Claimed");
  const fulfilledOrders = deals.filter((d) => d.claimStatus === "Fulfilled");
  const lowStockProducts = products.filter(
    (p) => p.unitsRemaining < 50 && p.unitsRemaining > 0
  );
  const activeDeals = deals.filter(
    (d) => d.status === "Active" && d.claimStatus === "Not Claimed"
  );

  const stats = [
    {
      title: "Active Deals",
      value: activeDeals.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Claims",
      value: pendingClaims.length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Fulfilled Orders",
      value: fulfilledOrders.length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your wholesale operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Pending Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span>Recent Pending Claims</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingClaims.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending claims</p>
          ) : (
            <div className="space-y-3">
              {pendingClaims.slice(0, 5).map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {deal.productName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {deal.clientName} •{" "}
                      <span className="font-medium">{deal.claimedUnits}</span>{" "}
                      units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${deal.snapshotPrice?.toFixed(2) || deal.lindaSellingPrice?.toFixed(2)} / unit
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {deal.claimDate
                        ? format(new Date(deal.claimDate), "MMM d, yyyy")
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg"
                >
                  <p className="font-medium text-gray-900 line-clamp-1">
                    {product.productName}
                  </p>
                  <Badge variant="destructive">
                    {product.unitsRemaining} units left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
