import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProducts } from "@/lib/airtable";
import ProductCard from "@/components/products/product-card";
import { Package, Search } from "lucide-react";

export default async function DealsPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId || "";

  // Fetch all available products from Master Inventory
  const products = await getProducts();

  // Filter products that have units available
  const availableProducts = products.filter(
    (product) => (product.unitsRemaining || product.unitsAvailable || 0) > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-600 mt-1">
            Browse available products and place orders
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Package className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">
              {availableProducts.length}
            </span>{" "}
            products available
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {availableProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No products available
          </h3>
          <p className="text-gray-500 mt-1">
            Check back later for new products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((product) => (
            <ProductCard key={product.id} product={product} clientId={clientId} />
          ))}
        </div>
      )}
    </div>
  );
}
