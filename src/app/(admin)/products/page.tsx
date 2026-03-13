import { getProducts } from "@/lib/airtable";
import ProductsTable from "@/components/admin/products-table";

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductsTable products={products} />;
}
