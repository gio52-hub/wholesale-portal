import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClientDeal } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, clientId, units } = body;

    if (!productId || !clientId || !units) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (units < 1) {
      return NextResponse.json(
        { error: "Units must be at least 1" },
        { status: 400 }
      );
    }

    // Create a Client Deal record in Airtable
    const dealId = await createClientDeal({
      productId,
      clientId,
      claimedUnits: units,
    });

    return NextResponse.json({
      success: true,
      dealId,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
