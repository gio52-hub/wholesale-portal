import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      return NextResponse.json(
        { error: "Missing Airtable credentials", baseId: !!baseId, apiKey: !!apiKey },
        { status: 500 }
      );
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Claims History")}`;
    
    console.log("Fetching claims from:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", response.status, errorText);
      return NextResponse.json(
        { 
          error: "Airtable API error", 
          status: response.status, 
          statusText: response.statusText,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      recordCount: data.records?.length || 0,
      firstRecord: data.records?.[0] || null,
      fieldNames: data.records?.[0] ? Object.keys(data.records[0].fields) : [],
    });
  } catch (error) {
    console.error("Error in claims API:", error);
    return NextResponse.json(
      { 
        error: "Server error", 
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
