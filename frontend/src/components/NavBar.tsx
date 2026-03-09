"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function NavBar() {
  const { user, organisation, logout } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!user || isAuthPage) return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="font-bold text-lg text-indigo-600 tracking-tight"
        >
          StockFlow
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* User section */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500 hidden sm:block">
            {organisation?.name}
          </span>
          <span className="text-gray-700">{user?.email}</span>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
