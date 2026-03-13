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

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Master Inventory")}?maxRecords=1`;
    
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
    const firstRecord = data.records?.[0];
    
    return NextResponse.json({
      success: true,
      recordCount: data.records?.length || 0,
      fieldNames: firstRecord ? Object.keys(firstRecord.fields) : [],
      firstRecordFields: firstRecord?.fields || {},
      internalStatusValue: firstRecord?.fields["Internal Status"],
      internalStatusType: typeof firstRecord?.fields["Internal Status"],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
