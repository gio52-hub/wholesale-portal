import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ClientNavbar from "@/components/layout/client-navbar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientNavbar user={session.user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
