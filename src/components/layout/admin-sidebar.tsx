"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  Handshake,
  PlusSquare,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/client-deals", label: "Client Deals", icon: Handshake },
  { href: "/batch-create", label: "Batch Create", icon: PlusSquare },
  { href: "/claims", label: "Claims History", icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center justify-center">
          <div className="bg-white rounded-lg p-2">
            <Image
              src="/logo.jpg"
              alt="Smart Launch"
              width={120}
              height={32}
              className="h-6 w-auto"
            />
          </div>
        </Link>
        <p className="text-center text-xs text-gray-400 mt-2">Admin Portal</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
