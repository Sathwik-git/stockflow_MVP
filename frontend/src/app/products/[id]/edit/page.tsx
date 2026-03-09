"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductForm } from "@/components/ProductForm";
import { products as api, type Product, ApiError } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(id)
      .then(setProduct)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Product not found"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <ProtectedRoute>
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
      {product && <ProductForm initialData={product} />}
    </ProtectedRoute>
  );
}
