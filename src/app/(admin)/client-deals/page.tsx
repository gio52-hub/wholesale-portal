import { getAllDeals } from "@/lib/airtable";
import DealsTable from "@/components/admin/deals-table";

export default async function DealsPage() {
  const deals = await getAllDeals();

  return <DealsTable deals={deals} />;
}
