import { getProducts } from "@/lib/airtable";
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
import { Package, ExternalLink } from "lucide-react";

export default async function ProductsPage() {
  const products = await getProducts();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "Low Stock":
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case "Sold Out":
        return <Badge variant="destructive">Sold Out</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInternalStatusBadge = (status: string) => {
    switch (status) {
      case "Proposed / Potential":
        return <Badge variant="outline">Proposed</Badge>;
      case "Confirmed":
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "Purchased / In stock":
        return <Badge className="bg-green-500">In Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
            <span className="font-semibold text-primary">{products.length}</span>{" "}
            products
          </span>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Product Name</TableHead>
                <TableHead>Retail Price</TableHead>
                <TableHead>Your Cost</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Internal Status</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium max-w-xs">
                    <span className="line-clamp-2">{product.productName}</span>
                  </TableCell>
                  <TableCell>${product.walmartRetailPrice?.toFixed(2)}</TableCell>
                  <TableCell>${product.lindaActualCost?.toFixed(2)}</TableCell>
                  <TableCell>${product.walmartFees?.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{product.unitsRemaining}</span>
                    <span className="text-gray-400">
                      {" "}
                      / {product.unitsAvailable}
                    </span>
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
                        className="text-primary hover:text-primary-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
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
