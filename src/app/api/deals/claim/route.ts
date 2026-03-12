import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { claimDeal } from "@/lib/airtable";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dealId, claimedUnits } = await request.json();

    if (!dealId || !claimedUnits) {
      return NextResponse.json(
        { error: "Missing dealId or claimedUnits" },
        { status: 400 }
      );
    }

    if (claimedUnits <= 0) {
      return NextResponse.json(
        { error: "Invalid claimed units" },
        { status: 400 }
      );
    }

    await claimDeal(dealId, claimedUnits);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to claim deal" },
      { status: 500 }
    );
  }
}
