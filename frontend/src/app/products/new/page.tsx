"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <ProductForm />
    </ProtectedRoute>
  );
}
