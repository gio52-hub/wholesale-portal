"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusSquare,
  Package,
  Users,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";

interface Product {
  id: string;
  productName: string;
  unitsRemaining: number;
}

interface Client {
  id: string;
  clientName: string;
}

export default function BatchCreatePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [defaultPrice, setDefaultPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/products"),
      ]);
      const clientsData = await clientsRes.json();
      const productsData = await productsRes.json();
      setClients(clientsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedClient || selectedProducts.length === 0) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/deals/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          productIds: selectedProducts,
          defaultPrice: defaultPrice ? parseFloat(defaultPrice) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setCreatedCount(data.created);
        setSelectedClient("");
        setSelectedProducts([]);
        setDefaultPrice("");

        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to create deals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Batch Create Deals</h1>
        <p className="text-gray-600 mt-1">
          Create multiple deals for a client at once
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-green-800">
            Successfully created {createdCount} deals!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PlusSquare className="h-5 w-5 text-primary" />
              <span>Create Deals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Select Client</span>
              </Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Price */}
            <div className="space-y-2">
              <Label>Default Selling Price (Optional)</Label>
              <Input
                type="number"
                step="0.01"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                placeholder="e.g., 5.00"
              />
              <p className="text-xs text-gray-500">
                Leave blank to set prices individually later
              </p>
            </div>

            {/* Product Search */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Select Products ({selectedProducts.length} selected)</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No products found
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center justify-between p-3 cursor-pointer border-b last:border-b-0 transition ${
                        isSelected
                          ? "bg-primary-50 border-l-4 border-l-primary"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <p
                          className={`text-sm line-clamp-1 ${
                            isSelected ? "font-medium" : ""
                          }`}
                        >
                          {product.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.unitsRemaining} units available
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-primary hover:bg-primary-600"
              onClick={handleSubmit}
              disabled={
                !selectedClient || selectedProducts.length === 0 || isLoading
              }
            >
              {isLoading
                ? "Creating..."
                : `Create ${selectedProducts.length} Deal${
                    selectedProducts.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient && selectedProducts.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold">
                    {clients.find((c) => c.id === selectedClient)?.clientName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Products ({selectedProducts.length})
                  </p>
                  <div className="space-y-2">
                    {selectedProducts.map((productId) => {
                      const product = products.find((p) => p.id === productId);
                      return product ? (
                        <div
                          key={productId}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <span className="text-sm line-clamp-1 flex-1 pr-2">
                            {product.productName}
                          </span>
                          <button
                            onClick={() => toggleProduct(productId)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {defaultPrice && (
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Default Price</p>
                    <p className="font-semibold text-primary">
                      ${parseFloat(defaultPrice).toFixed(2)} / unit
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PlusSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a client and products to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
