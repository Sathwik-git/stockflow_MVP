"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { products as api, type Product, ApiError } from "@/lib/api";
import { AdjustStockModal } from "@/components/AdjustStockModal";

export default function ProductsPage() {
  const router = useRouter();
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    api
      .list(debouncedQuery || undefined)
      .then(setProductList)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load products",
        ),
      )
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(id);
      setProductList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <Link
            href="/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Product
          </Link>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search by name or SKU…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2" />
              Loading products…
            </div>
          ) : productList.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {debouncedQuery
                ? "No products match your search."
                : "No products yet. Add your first product!"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Selling Price
                    </th>
                    <th className="px-4 py-3 font-medium text-center">Stock</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map((product) => {
                    const threshold = product.low_stock_threshold ?? 5;
                    const isLow = product.quantity <= threshold;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                          {product.sku}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {product.selling_price != null
                            ? `$${Number(product.selling_price).toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setAdjustTarget(product)}
                              className="text-xs text-indigo-600 hover:underline font-medium"
                            >
                              Adjust
                            </button>
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="text-xs text-gray-600 hover:underline font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              disabled={deletingId === product.id}
                              className="text-xs text-red-500 hover:underline font-medium disabled:opacity-50"
                            >
                              {deletingId === product.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {adjustTarget && (
        <AdjustStockModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSuccess={(updated) => {
            setProductList((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p)),
            );
            setAdjustTarget(null);
          }}
        />
      )}
    </ProtectedRoute>
  );
}
