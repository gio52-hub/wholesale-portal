import Airtable from "airtable";
import { Product, Client, Deal, ClaimHistory } from "@/types";

// Configure Airtable with extended timeout for serverless environments
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: "https://api.airtable.com",
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);

export const tables = {
  masterInventory: base("Master Inventory"),
  clients: base("Clients"),
  clientDeals: base("Client Deals"),
  claimsHistory: base("Claims History"),
  createDealsBatch: base("Create Deals - Batch"),
};

// ============ REST API HELPER ============
// Use REST API directly to avoid AbortSignal issues in serverless

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

async function fetchFromAirtable(
  tableName: string,
  options?: { filterByFormula?: string; maxRecords?: number }
): Promise<AirtableRecord[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    console.error("Missing Airtable credentials");
    return [];
  }

  const params = new URLSearchParams();
  if (options?.filterByFormula) {
    params.append("filterByFormula", options.filterByFormula);
  }
  if (options?.maxRecords) {
    params.append("maxRecords", options.maxRecords.toString());
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;

  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const fetchUrl = offset ? `${url}&offset=${offset}` : url;
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Airtable API error: ${response.status} ${response.statusText}`);
      return allRecords;
    }

    const data: AirtableResponse = await response.json();
    allRecords.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return allRecords;
}

// ============ PRODUCTS ============

export async function getProducts(): Promise<Product[]> {
  try {
    // Use REST API directly to avoid AbortSignal issues
    const records = await fetchFromAirtable("Master Inventory", {
      filterByFormula: "{Status} = 'Active'",
    });

    console.log(`Fetched ${records.length} products from Master Inventory`);

    return records.map((record) => ({
      id: record.id,
      productName: (record.fields["Product Name"] as string) || "",
      walmartLink: (record.fields["Walmart Link"] as string) || "",
      walmartRetailPrice: (record.fields["Walmart Retail Price"] as number) || 0,
      lindaActualCost: (record.fields["Linda's Actual Cost"] as number) || 0,
      walmartFees: (record.fields["Walmart Fees"] as number) || 0,
      unitsAvailable: (record.fields["Units Available"] as number) || 0,
      unitsRemaining: (record.fields["Units Remaining"] as number) || 0,
      leadTime: (record.fields["Lead Time"] as string) || "Ready to Ship",
      status: (record.fields["Status"] as string) || "Active",
      internalStatus: (record.fields["Internal Status"] as string) || "Proposed / Potential",
      inventoryStatus: (record.fields["Inventory Status"] as string) || "Available",
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
    // Use REST API directly to avoid AbortSignal issues
    const records = await fetchFromAirtable("Clients");
    console.log(`Fetched ${records.length} clients from Clients table`);

    return records.map((record) => ({
      id: record.id,
      clientName: (record.fields["Client Name"] as string) || "",
      contactEmail: (record.fields["Contact Email"] as string) || "",
      company: (record.fields["Company"] as string) || "",
      phone: (record.fields["Phone"] as string) || "",
      notes: (record.fields["Notes"] as string) || "",
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function getClientByEmail(email: string): Promise<Client | null> {
  try {
    console.log(`Looking for client with email: ${email}`);
    
    // Use REST API directly to avoid AbortSignal issues in serverless
    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    
    if (!baseId || !apiKey) {
      console.error("Missing Airtable credentials");
      return null;
    }

    const formula = encodeURIComponent(`LOWER({Contact Email}) = '${email.toLowerCase()}'`);
    const url = `https://api.airtable.com/v0/${baseId}/Clients?filterByFormula=${formula}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Airtable API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Found ${data.records?.length || 0} clients matching email`);

    if (!data.records || data.records.length === 0) return null;

    const record = data.records[0];
    return {
      id: record.id,
      clientName: record.fields["Client Name"] || "",
      contactEmail: record.fields["Contact Email"] || "",
      company: record.fields["Company"] || "",
      phone: record.fields["Phone"] || "",
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
    console.log(`Fetching deals for client: ${clientId}`);
    
    // Use REST API directly to avoid AbortSignal issues
    // Fetch all deals (don't filter by Status to handle various field values)
    const records = await fetchFromAirtable("Client Deals");

    console.log(`Found ${records.length} total deals in Client Deals table`);

    // Filter deals that belong to this client
    const clientDeals = records.filter((record) => {
      const clientField = record.fields["Client"] as string[] | undefined;
      const status = record.fields["Status"] as string | undefined;
      // Include deals that are Active or have no Status set (default to active)
      const isActive = !status || status === "Active";
      return clientField && clientField.includes(clientId) && isActive;
    });

    console.log(`Found ${clientDeals.length} deals for client ${clientId}`);

    return clientDeals.map((record) => mapDealRecordFromRest(record));
  } catch (error) {
    console.error("Error fetching deals for client:", error);
    return [];
  }
}

export async function getAllDeals(): Promise<Deal[]> {
  try {
    // Use REST API directly to avoid AbortSignal issues
    const records = await fetchFromAirtable("Client Deals");
    console.log(`Fetched ${records.length} total deals`);
    return records.map((record) => mapDealRecordFromRest(record));
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

  // Get Walmart fields (lookup fields)
  const walmartRetailPriceRaw = record.get("Walmart Retail Price");
  const walmartRetailPrice = 
    typeof walmartRetailPriceRaw === "number" ? walmartRetailPriceRaw :
    Array.isArray(walmartRetailPriceRaw) ? (walmartRetailPriceRaw as unknown as number[])[0] || 0 :
    0;

  const walmartFeesRaw = record.get("Walmart Fees");
  const walmartFees = 
    typeof walmartFeesRaw === "number" ? walmartFeesRaw :
    Array.isArray(walmartFeesRaw) ? (walmartFeesRaw as unknown as number[])[0] || 0 :
    0;

  // Get Client's Total Fees (formula field)
  const clientTotalFeesRaw = record.get("Client's Total Fees");
  const clientTotalFees = 
    typeof clientTotalFeesRaw === "number" ? clientTotalFeesRaw :
    walmartFees; // Fallback to Walmart Fees

  const walmartLinkRaw = record.get("Walmart Link");
  const walmartLink = 
    typeof walmartLinkRaw === "string" ? walmartLinkRaw :
    Array.isArray(walmartLinkRaw) ? (walmartLinkRaw as string[])[0] || "" :
    "";

  return {
    id: record.id,
    dealId: (record.get("Deal ID") as number) || 0,
    product: (record.get("Product") as string[]) || [],
    productName,
    client: (record.get("Client") as string[]) || [],
    clientName,
    clientEmail,
    lindaSellingPrice: (record.get("Linda's Selling Price") as number) || 0,
    walmartRetailPrice,
    walmartFees,
    clientTotalFees,
    walmartLink,
    clientProfit: (record.get("Client's Profit") as number) || 0,
    clientROI: (record.get("Client's ROI (%)") as number) || 0,
    lindaProfit: (record.get("Linda's Profit") as number) || 0,
    lindaROI: (record.get("Linda's ROI (%)") as number) || 0,
    unitsRemaining,
    leadTime,
    claimedUnits: (record.get("Claimed Units") as number) || 0,
    claimDate: (record.get("Claim Date") as string) || "",
    claimStatus: (record.get("Claim Status") as string) || "Not Claimed",
    status: (record.get("Status") as string) || "Active",
    snapshotPrice: (record.get("Snapshot - Price") as number) || 0,
    snapshotClientROI: (record.get("Snapshot - Client ROI") as number) || 0,
    snapshotClientProfit: (record.get("Snapshot - Client Profit") as number) || 0,
  };
}

// REST API version of mapDealRecord
function mapDealRecordFromRest(record: AirtableRecord): Deal {
  const fields = record.fields;
  
  // Handle various lookup field naming conventions
  const productName = 
    (fields["Product Name"] as string) ||
    (fields["Product Name (from Product)"] as string[])?.join(", ") ||
    "";
  
  const clientName = 
    (fields["Client Name"] as string) ||
    (fields["Client Name (from Client)"] as string[])?.join(", ") ||
    "";
  
  const clientEmail = 
    (fields["Contact Email"] as string) ||
    (fields["Claimed By Email"] as string) ||
    (fields["Contact Email (from Client)"] as string[])?.join(", ") ||
    "";

  const unitsRemainingRaw = fields["Units Remaining"];
  const unitsRemaining = 
    typeof unitsRemainingRaw === "number" ? unitsRemainingRaw :
    Array.isArray(unitsRemainingRaw) ? (unitsRemainingRaw as number[])[0] || 0 :
    0;

  const leadTimeRaw = fields["Lead Time"];
  const leadTime = 
    typeof leadTimeRaw === "string" ? leadTimeRaw :
    Array.isArray(leadTimeRaw) ? (leadTimeRaw as string[])[0] || "Ready to Ship" :
    "Ready to Ship";

  // Get Walmart Retail Price (lookup field)
  const walmartRetailPriceRaw = fields["Walmart Retail Price"];
  const walmartRetailPrice = 
    typeof walmartRetailPriceRaw === "number" ? walmartRetailPriceRaw :
    Array.isArray(walmartRetailPriceRaw) ? (walmartRetailPriceRaw as number[])[0] || 0 :
    0;

  // Get Walmart Fees (lookup field)
  const walmartFeesRaw = fields["Walmart Fees"];
  const walmartFees = 
    typeof walmartFeesRaw === "number" ? walmartFeesRaw :
    Array.isArray(walmartFeesRaw) ? (walmartFeesRaw as number[])[0] || 0 :
    0;

  // Get Client's Total Fees (formula field: Walmart Fees + Prep Fee)
  const clientTotalFeesRaw = fields["Client's Total Fees"];
  const clientTotalFees = 
    typeof clientTotalFeesRaw === "number" ? clientTotalFeesRaw :
    walmartFees; // Fallback to Walmart Fees if Client's Total Fees doesn't exist

  // Get Walmart Link (lookup field)
  const walmartLinkRaw = fields["Walmart Link"];
  const walmartLink = 
    typeof walmartLinkRaw === "string" ? walmartLinkRaw :
    Array.isArray(walmartLinkRaw) ? (walmartLinkRaw as string[])[0] || "" :
    "";

  return {
    id: record.id,
    dealId: (fields["Deal ID"] as number) || 0,
    product: (fields["Product"] as string[]) || [],
    productName,
    client: (fields["Client"] as string[]) || [],
    clientName,
    clientEmail,
    lindaSellingPrice: (fields["Linda's Selling Price"] as number) || 0,
    walmartRetailPrice,
    walmartFees,
    clientTotalFees,
    walmartLink,
    clientProfit: (fields["Client's Profit"] as number) || 0,
    clientROI: (fields["Client's ROI (%)"] as number) || 0,
    lindaProfit: (fields["Linda's Profit"] as number) || 0,
    lindaROI: (fields["Linda's ROI (%)"] as number) || 0,
    unitsRemaining,
    leadTime,
    claimedUnits: (fields["Claimed Units"] as number) || 0,
    claimDate: (fields["Claim Date"] as string) || "",
    claimStatus: (fields["Claim Status"] as string) || "Not Claimed",
    status: (fields["Status"] as string) || "Active",
    snapshotPrice: (fields["Snapshot - Price"] as number) || 0,
    snapshotClientROI: (fields["Snapshot - Client ROI"] as number) || 0,
    snapshotClientProfit: (fields["Snapshot - Client Profit"] as number) || 0,
  };
}

export async function claimDeal(
  dealId: string,
  claimedUnits: number
): Promise<void> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    throw new Error("Missing Airtable credentials");
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Client Deals")}/${dealId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        "Claimed Units": claimedUnits,
        "Claim Date": new Date().toISOString().split("T")[0],
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Airtable claim error:", errorData);
    throw new Error(`Failed to claim deal: ${response.statusText}`);
  }
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

export async function createClientDeal(data: {
  productId: string;
  clientId: string;
  claimedUnits: number;
}): Promise<string> {
  // Create a new Client Deal with claimed units (order from client portal)
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    throw new Error("Missing Airtable credentials");
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Client Deals")}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Product: [data.productId],
        Client: [data.clientId],
        "Claimed Units": data.claimedUnits,
        "Claim Date": new Date().toISOString().split("T")[0],
        Status: "Active",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Airtable error:", errorData);
    throw new Error("Failed to create client deal");
  }

  const result = await response.json();
  return result.id;
}

export async function batchCreateDeals(
  clientId: string,
  productIds: string[],
  defaultPrice?: number
): Promise<number> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !apiKey) {
    throw new Error("Missing Airtable credentials");
  }

  const records = productIds.map((productId) => ({
    fields: {
      Product: [productId],
      Client: [clientId],
      "Linda's Selling Price": defaultPrice || 0,
      Status: "Active",
    },
  }));

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Client Deals")}`;
  
  let created = 0;
  
  // Airtable allows max 10 records per request
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: batch }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Airtable batch create error:", errorData);
      throw new Error(`Failed to create deals: ${response.statusText}`);
    }

    const result = await response.json();
    created += result.records?.length || 0;
  }

  return created;
}

// ============ CLAIMS HISTORY ============

export async function getClaimsHistory(): Promise<ClaimHistory[]> {
  try {
    // Use REST API to avoid AbortSignal issues
    const records = await fetchFromAirtable("Claims History");
    
    return records.map((record) => ({
      id: record.id,
      claimId: (record.fields["Claim ID"] as number) || 0,
      deal: (record.fields["Deal"] as string[]) || [],
      quantityClaimed: (record.fields["Quantity Claimed"] as number) || 0,
      claimTimestamp: (record.fields["Claim Timestamp"] as string) || "",
      status: (record.fields["Status"] as string) || "Submitted",
      fulfillmentDate: (record.fields["Fulfillment Date"] as string) || "",
      fulfillmentNotes: (record.fields["Fulfillment Notes"] as string) || "",
      productName: (record.fields["Product Name"] as string) || "",
      clientName: (record.fields["Client Name"] as string) || "",
      snapshotPrice: (record.fields["Snapshot Price"] as number) || 0,
      snapshotROI: (record.fields["Snapshot ROI"] as number) || 0,
      totalValue: (record.fields["Total Value"] as number) || 0,
    }));
  } catch (error) {
    console.error("Error fetching claims history:", error);
    return [];
  }
}
