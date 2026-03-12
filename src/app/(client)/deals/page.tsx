import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDealsForClient } from "@/lib/airtable";
import DealCard from "@/components/deals/deal-card";
import { Package, Search } from "lucide-react";

export default async function DealsPage() {
  const session = await getServerSession(authOptions);
  const clientId = session?.user?.clientId;

  const deals = clientId ? await getDealsForClient(clientId) : [];

  const availableDeals = deals.filter(
    (deal) => !deal.claimStatus || deal.claimStatus === "Not Claimed"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-600 mt-1">
            Browse available products and claim units
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Package className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">
              {availableDeals.length}
            </span>{" "}
            deals available
          </span>
        </div>
      </div>

      {/* Deals Grid */}
      {availableDeals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No deals available
          </h3>
          <p className="text-gray-500 mt-1">
            Check back later for new products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
