"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ClaimsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Claims History</h1>
        <p className="text-gray-600 mt-1">View all claim records</p>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Error Loading Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">
            {error.message || "An error occurred while loading claims history."}
          </p>
          <p className="text-sm text-red-600 mb-4">
            This could be due to:
            <br />• Network connectivity issues
            <br />• Airtable API configuration
            <br />• Missing &quot;Claims History&quot; table in Airtable
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
          )}
          <Button onClick={reset} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
