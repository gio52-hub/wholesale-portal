import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Airtable credentials" },
        { status: 500 }
      );
    }

    // Fetch ALL products (not just 1) to see all Internal Status values
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Master Inventory")}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Airtable API error", status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const records = data.records || [];
    
    // Find all fields that contain "status" (case insensitive)
    const firstRecord = records[0];
    const statusFields = firstRecord 
      ? Object.keys(firstRecord.fields).filter(k => k.toLowerCase().includes('status'))
      : [];

    // Get Internal Status for all products
    const allInternalStatuses = records.map((r: { id: string; fields: Record<string, unknown> }) => ({
      id: r.id,
      productName: r.fields["Product Name"],
      internalStatus: r.fields["Internal Status"],
      allStatusFields: statusFields.reduce((acc: Record<string, unknown>, field: string) => {
        acc[field] = r.fields[field];
        return acc;
      }, {}),
    }));
    
    return NextResponse.json({
      success: true,
      recordCount: records.length,
      allFieldNames: firstRecord ? Object.keys(firstRecord.fields).sort() : [],
      statusRelatedFields: statusFields,
      allProducts: allInternalStatuses,
      rawFirstRecord: firstRecord?.fields,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
