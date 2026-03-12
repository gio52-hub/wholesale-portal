import Airtable from "airtable";
import { Product, Client, Deal, ClaimHistory } from "@/types";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export const tables = {
  masterInventory: base("Master Inventory"),
  clients: base("Clients"),
  clientDeals: base("Client Deals"),
  claimsHistory: base("Claims History"),
  createDealsBatch: base("Create Deals - Batch"),
};

// ============ PRODUCTS ============

export async function getProducts(): Promise<Product[]> {
  try {
    const records = await tables.masterInventory
      .select({ filterByFormula: "{Status} = 'Active'" })
      .all();

    console.log(`Fetched ${records.length} products from Master Inventory`);

    return records.map((record) => ({
      id: record.id,
      productName: (record.get("Product Name") as string) || "",
      walmartLink: (record.get("Walmart Link") as string) || "",
      walmartRetailPrice: (record.get("Walmart Retail Price") as number) || 0,
      lindaActualCost: (record.get("Linda's Actual Cost") as number) || 0,
      walmartFees: (record.get("Walmart Fees") as number) || 0,
      unitsAvailable: (record.get("Units Available") as number) || 0,
      unitsRemaining: (record.get("Units Remaining") as number) || 0,
      leadTime: (record.get("Lead Time") as string) || "Ready to Ship",
      status: (record.get("Status") as string) || "Active",
      internalStatus: (record.get("Internal Status") as string) || "Proposed / Potential",
      inventoryStatus: (record.get("Inventory Status") as string) || "Available",
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const record = await tables.masterInventory.find(id);
    return {
      id: record.id,
      productName: (record.get("Product Name") as string) || "",
      walmartLink: (record.get("Walmart Link") as string) || "",
      walmartRetailPrice: (record.get("Walmart Retail Price") as number) || 0,
      lindaActualCost: (record.get("Linda's Actual Cost") as number) || 0,
      walmartFees: (record.get("Walmart Fees") as number) || 0,
      unitsAvailable: (record.get("Units Available") as number) || 0,
      unitsRemaining: (record.get("Units Remaining") as number) || 0,
      leadTime: (record.get("Lead Time") as string) || "Ready to Ship",
      status: (record.get("Status") as string) || "Active",
      internalStatus: (record.get("Internal Status") as string) || "Proposed / Potential",
      inventoryStatus: (record.get("Inventory Status") as string) || "Available",
    };
  } catch {
    return null;
  }
}

export async function createProduct(data: Partial<Product>): Promise<string> {
  const record = await tables.masterInventory.create({
    "Product Name": data.productName,
    "Walmart Link": data.walmartLink,
    "Walmart Retail Price": data.walmartRetailPrice,
    "Linda's Actual Cost": data.lindaActualCost,
    "Walmart Fees": data.walmartFees,
    "Units Available": data.unitsAvailable,
    "Lead Time": data.leadTime,
    Status: data.status || "Active",
    "Internal Status": data.internalStatus || "Proposed / Potential",
  });
  return record.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  const fields: Airtable.FieldSet = {};
  if (data.productName !== undefined) fields["Product Name"] = data.productName;
  if (data.walmartLink !== undefined) fields["Walmart Link"] = data.walmartLink;
  if (data.walmartRetailPrice !== undefined)
    fields["Walmart Retail Price"] = data.walmartRetailPrice;
  if (data.lindaActualCost !== undefined)
    fields["Linda's Actual Cost"] = data.lindaActualCost;
  if (data.walmartFees !== undefined) fields["Walmart Fees"] = data.walmartFees;
  if (data.unitsAvailable !== undefined)
    fields["Units Available"] = data.unitsAvailable;
  if (data.leadTime !== undefined) fields["Lead Time"] = data.leadTime;
  if (data.status !== undefined) fields["Status"] = data.status;
  if (data.internalStatus !== undefined)
    fields["Internal Status"] = data.internalStatus;

  await tables.masterInventory.update(id, fields);
}

// ============ CLIENTS ============

export async function getClients(): Promise<Client[]> {
  try {
    const records = await tables.clients.select().all();
    console.log(`Fetched ${records.length} clients from Clients table`);

    return records.map((record) => ({
      id: record.id,
      clientName: (record.get("Client Name") as string) || "",
      contactEmail: (record.get("Contact Email") as string) || "",
      company: (record.get("Company") as string) || "",
      phone: (record.get("Phone") as string) || "",
      notes: (record.get("Notes") as string) || "",
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function getClientByEmail(email: string): Promise<Client | null> {
  try {
    console.log(`Looking for client with email: ${email}`);
    const records = await tables.clients
      .select({ filterByFormula: `LOWER({Contact Email}) = '${email.toLowerCase()}'` })
      .all();

    console.log(`Found ${records.length} clients matching email`);

    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.id,
      clientName: (record.get("Client Name") as string) || "",
      contactEmail: (record.get("Contact Email") as string) || "",
      company: (record.get("Company") as string) || "",
      phone: (record.get("Phone") as string) || "",
    };
  } catch (error) {
    console.error("Error fetching client by email:", error);
    return null;
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const record = await tables.clients.find(id);
    return {
      id: record.id,
      clientName: (record.get("Client Name") as string) || "",
      contactEmail: (record.get("Contact Email") as string) || "",
      company: (record.get("Company") as string) || "",
      phone: (record.get("Phone") as string) || "",
    };
  } catch {
    return null;
  }
}

export async function createClient(data: Partial<Client>): Promise<string> {
  const record = await tables.clients.create({
    "Client Name": data.clientName,
    "Contact Email": data.contactEmail,
    Company: data.company,
    Phone: data.phone,
    Notes: data.notes,
  });
  return record.id;
}

export async function updateClient(
  id: string,
  data: Partial<Client>
): Promise<void> {
  const fields: Airtable.FieldSet = {};
  if (data.clientName !== undefined) fields["Client Name"] = data.clientName;
  if (data.contactEmail !== undefined)
    fields["Contact Email"] = data.contactEmail;
  if (data.company !== undefined) fields["Company"] = data.company;
  if (data.phone !== undefined) fields["Phone"] = data.phone;
  if (data.notes !== undefined) fields["Notes"] = data.notes;

  await tables.clients.update(id, fields);
}

// ============ DEALS ============

export async function getDealsForClient(clientId: string): Promise<Deal[]> {
  try {
    const records = await tables.clientDeals
      .select({
        filterByFormula: `{Status} = 'Active'`,
      })
      .all();

    // Filter deals that belong to this client
    const clientDeals = records.filter((record) => {
      const clientField = record.get("Client") as string[] | undefined;
      return clientField && clientField.includes(clientId);
    });

    return clientDeals.map((record) => mapDealRecord(record));
  } catch (error) {
    console.error("Error fetching deals for client:", error);
    return [];
  }
}

export async function getAllDeals(): Promise<Deal[]> {
  try {
    const records = await tables.clientDeals.select().all();
    return records.map((record) => mapDealRecord(record));
  } catch (error) {
    console.error("Error fetching all deals:", error);
    return [];
  }
}

export async function getDealById(id: string): Promise<Deal | null> {
  try {
    const record = await tables.clientDeals.find(id);
    return mapDealRecord(record);
  } catch {
    return null;
  }
}

function mapDealRecord(record: Airtable.Record<Airtable.FieldSet>): Deal {
  // Handle various lookup field naming conventions
  const productName = 
    (record.get("Product Name") as string) ||
    (record.get("Product Name (from Product)") as string[])?.join(", ") ||
    "";
  
  const clientName = 
    (record.get("Client Name") as string) ||
    (record.get("Client Name (from Client)") as string[])?.join(", ") ||
    "";
  
  const clientEmail = 
    (record.get("Contact Email") as string) ||
    (record.get("Claimed By Email") as string) ||
    (record.get("Contact Email (from Client)") as string[])?.join(", ") ||
    "";

  const unitsRemainingRaw = record.get("Units Remaining");
  const unitsRemaining = 
    typeof unitsRemainingRaw === "number" ? unitsRemainingRaw :
    Array.isArray(unitsRemainingRaw) ? (unitsRemainingRaw as unknown as number[])[0] || 0 :
    0;

  const leadTimeRaw = record.get("Lead Time");
  const leadTime = 
    typeof leadTimeRaw === "string" ? leadTimeRaw :
    Array.isArray(leadTimeRaw) ? (leadTimeRaw as string[])[0] || "Ready to Ship" :
    "Ready to Ship";

  return {
    id: record.id,
    dealId: (record.get("Deal ID") as number) || 0,
    product: (record.get("Product") as string[]) || [],
    productName,
    client: (record.get("Client") as string[]) || [],
    clientName,
    clientEmail,
    lindaSellingPrice: (record.get("Linda's Selling Price") as number) || 0,
    clientProfit: (record.get("Client's Profit") as number) || 0,
    clientROI: (record.get("Client's ROI (%)") as number) || 0,
    lindaProfit: (record.get("Linda's Profit") as number) || 0,
    lindaROI: (record.get("Linda's ROI (%)") as number) || 0,
    unitsRemaining: (record.get("Units Remaining") as number) || 0,
    leadTime: (record.get("Lead Time") as string) || "Ready to Ship",
    claimedUnits: (record.get("Claimed Units") as number) || 0,
    claimDate: (record.get("Claim Date") as string) || "",
    claimStatus: (record.get("Claim Status") as string) || "Not Claimed",
    status: (record.get("Status") as string) || "Active",
    snapshotPrice: (record.get("Snapshot - Price") as number) || 0,
    snapshotClientROI: (record.get("Snapshot - Client ROI") as number) || 0,
    snapshotClientProfit: (record.get("Snapshot - Client Profit") as number) || 0,
  };
}

export async function claimDeal(
  dealId: string,
  claimedUnits: number
): Promise<void> {
  await tables.clientDeals.update(dealId, {
    "Claimed Units": claimedUnits,
    "Claim Date": new Date().toISOString(),
  });
}

export async function updateDealStatus(
  dealId: string,
  status: string
): Promise<void> {
  await tables.clientDeals.update(dealId, {
    "Claim Status": status,
  });
}

export async function createDeal(data: {
  productId: string;
  clientId: string;
  sellingPrice: number;
  status?: string;
}): Promise<string> {
  const record = await tables.clientDeals.create({
    Product: [data.productId],
    Client: [data.clientId],
    "Linda's Selling Price": data.sellingPrice,
    Status: data.status || "Active",
  });
  return record.id;
}

export async function batchCreateDeals(
  clientId: string,
  productIds: string[],
  defaultPrice?: number
): Promise<number> {
  const records = productIds.map((productId) => ({
    fields: {
      Product: [productId],
      Client: [clientId],
      "Linda's Selling Price": defaultPrice || 0,
      Status: "Active",
    },
  }));

  let created = 0;
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await tables.clientDeals.create(batch.map((r) => r.fields));
    created += batch.length;
  }

  return created;
}

// ============ CLAIMS HISTORY ============

export async function getClaimsHistory(): Promise<ClaimHistory[]> {
  const records = await tables.claimsHistory.select().all();

  return records.map((record) => ({
    id: record.id,
    claimId: (record.get("Claim ID") as number) || 0,
    deal: (record.get("Deal") as string[]) || [],
    quantityClaimed: (record.get("Quantity Claimed") as number) || 0,
    claimTimestamp: (record.get("Claim Timestamp") as string) || "",
    status: (record.get("Status") as string) || "Submitted",
    fulfillmentDate: (record.get("Fulfillment Date") as string) || "",
    fulfillmentNotes: (record.get("Fulfillment Notes") as string) || "",
    productName: (record.get("Product Name") as string) || "",
    clientName: (record.get("Client Name") as string) || "",
    snapshotPrice: (record.get("Snapshot Price") as number) || 0,
    snapshotROI: (record.get("Snapshot ROI") as number) || 0,
    totalValue: (record.get("Total Value") as number) || 0,
  }));
}
