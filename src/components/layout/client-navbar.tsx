"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, ShoppingCart, LogOut, User } from "lucide-react";

interface ClientNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function ClientNavbar({ user }: ClientNavbarProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/deals" className="flex items-center space-x-2">
            <Image
              src="/logo.jpg"
              alt="Smart Launch"
              width={150}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link href="/deals">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary hover:bg-primary-50"
              >
                <Package className="h-4 w-4" />
                <span>My Deals</span>
              </Button>
            </Link>
            <Link href="/orders">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary hover:bg-primary-50"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>My Orders</span>
              </Button>
            </Link>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-gray-700">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled className="text-gray-500">
                <User className="mr-2 h-4 w-4" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
