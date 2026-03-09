"use client";

import { useState } from "react";
import { products as api, type Product, ApiError } from "@/lib/api";

interface Props {
  product: Product;
  onClose: () => void;
  onSuccess: (updated: Product) => void;
}

export function AdjustStockModal({ product, onClose, onSuccess }: Props) {
  const [delta, setDelta] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const numDelta = parseInt(delta, 10);
    if (isNaN(numDelta) || numDelta === 0) {
      setError("Enter a non-zero integer (e.g. +5 or -3)");
      return;
    }
    setLoading(true);
    try {
      const res = await api.adjustStock(
        product.id,
        numDelta,
        note || undefined,
      );
      onSuccess(res.product);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Adjust failed");
    } finally {
      setLoading(false);
    }
  };

  const numDelta = parseInt(delta, 10);
  const preview = isNaN(numDelta)
    ? product.quantity
    : product.quantity + numDelta;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Adjust Stock
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">{product.name}</span> —
          Current qty: <span className="font-semibold">{product.quantity}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment (e.g. 5 or -3)
            </label>
            <input
              type="number"
              required
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 10 or -5"
            />
            {delta && !isNaN(numDelta) && (
              <p className="text-xs mt-1 text-gray-500">
                New quantity:{" "}
                <span
                  className={`font-semibold ${preview < 0 ? "text-red-600" : "text-gray-900"}`}
                >
                  {preview}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Stock received from supplier"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? "Saving…" : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
