import { getClaimsHistory } from "@/lib/airtable";
import ClaimsTable from "@/components/admin/claims-table";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ClaimHistory } from "@/types";

export default async function ClaimsPage() {
  let claims: ClaimHistory[] = [];
  let error: string | null = null;

  try {
    claims = await getClaimsHistory();
  } catch (e) {
    console.error("Error loading claims:", e);
    error = "Failed to load claims history. Please check Airtable configuration.";
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
          <p className="text-gray-600 mt-1">View all claim records</p>
        </div>
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
      </div>
    );
  }

  return <ClaimsTable claims={claims} />;
}
