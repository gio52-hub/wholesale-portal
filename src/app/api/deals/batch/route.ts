import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { batchCreateDeals } from "@/lib/airtable";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId, productIds, defaultPrice } = await request.json();

    if (!clientId || !productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: "Missing clientId or productIds" },
        { status: 400 }
      );
    }

    const created = await batchCreateDeals(clientId, productIds, defaultPrice);

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error("Batch create error:", error);
    return NextResponse.json(
      { error: "Failed to create deals" },
      { status: 500 }
    );
  }
}
