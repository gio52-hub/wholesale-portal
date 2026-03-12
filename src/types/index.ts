export interface Product {
  id: string;
  productName: string;
  walmartLink: string;
  walmartRetailPrice: number;
  lindaActualCost: number;
  walmartFees: number;
  unitsAvailable: number;
  unitsRemaining: number;
  leadTime: string;
  status: string;
  internalStatus: string;
  inventoryStatus: string;
  productImage?: string;
}

export interface Client {
  id: string;
  clientName: string;
  contactEmail: string;
  company: string;
  phone: string;
  notes?: string;
}

export interface Deal {
  id: string;
  dealId: number;
  product: string[];
  productName: string;
  client: string[];
  clientName: string;
  clientEmail: string;
  lindaSellingPrice: number;
  clientProfit: number;
  clientROI: number;
  lindaProfit: number;
  lindaROI: number;
  unitsRemaining: number;
  leadTime: string;
  claimedUnits: number;
  claimDate: string;
  claimStatus: string;
  status: string;
  snapshotPrice: number;
  snapshotClientROI: number;
  snapshotClientProfit: number;
  walmartLink?: string;
}

export interface ClaimHistory {
  id: string;
  claimId: number;
  deal: string[];
  quantityClaimed: number;
  claimTimestamp: string;
  status: string;
  fulfillmentDate?: string;
  fulfillmentNotes?: string;
  productName: string;
  clientName: string;
  snapshotPrice: number;
  snapshotROI: number;
  totalValue: number;
}

export interface BatchCreate {
  id: string;
  batchId: number;
  client: string[];
  products: string[];
  defaultSellingPrice: number;
  status: string;
  createdDealsCount: number;
}

declare module "next-auth" {
  interface User {
    role?: string;
    clientId?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      clientId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    clientId?: string;
  }
}
