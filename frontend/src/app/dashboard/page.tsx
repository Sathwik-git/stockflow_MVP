"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { dashboard, type DashboardData, ApiError } from "@/lib/api";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboard
      .get()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load dashboard",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
            Loading…
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label="Total Products" value={data.totalProducts} />
              <StatCard
                label="Total Units in Stock"
                value={data.totalQuantity}
              />
            </div>

            {/* Low stock section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">
                  Low Stock Items
                  {data.lowStockItems.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {data.lowStockItems.length}
                    </span>
                  )}
                </h2>
                <Link
                  href="/products"
                  className="text-sm text-indigo-600 hover:underline font-medium"
                >
                  View all products
                </Link>
              </div>

              {data.lowStockItems.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  No low stock items. Everything looks good!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="px-5 py-3 font-medium">Name</th>
                        <th className="px-5 py-3 font-medium">SKU</th>
                        <th className="px-5 py-3 font-medium text-right">
                          Qty on Hand
                        </th>
                        <th className="px-5 py-3 font-medium text-right">
                          Threshold
                        </th>
                        <th className="px-5 py-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                            {item.sku}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="font-semibold text-red-600">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-gray-500">
                            {item.low_stock_threshold}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/products/${item.id}/edit`}
                              className="text-indigo-600 hover:underline text-xs font-medium"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
