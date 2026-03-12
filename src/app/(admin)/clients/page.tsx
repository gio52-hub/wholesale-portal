import { getClients } from "@/lib/airtable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone, Building } from "lucide-react";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client accounts</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Users className="h-4 w-4" />
          <span>
            <span className="font-semibold text-primary">{clients.length}</span>{" "}
            clients
          </span>
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.clientName}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${client.contactEmail}`}
                      className="flex items-center text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {client.contactEmail}
                    </a>
                  </TableCell>
                  <TableCell>
                    {client.company && (
                      <span className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        {client.company}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.phone && (
                      <span className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {client.phone}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
