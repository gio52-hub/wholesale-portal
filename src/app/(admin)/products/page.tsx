import { getProducts } from "@/lib/airtable";
import ProductsTable from "@/components/admin/products-table";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductsTable products={products} />;
}
