import { getProducts } from "@/lib/airtable";
import ProductsTable from "@/components/admin/products-table";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getProducts();
  
  // Debug: Log all products' internal status on server
  console.log("=== Products Page Server Debug ===");
  products.forEach(p => {
    console.log(`[Server] ${p.productName}: internalStatus = "${p.internalStatus}"`);
  });
  console.log("=================================");

  return <ProductsTable products={products} />;
}
