const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sf_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error || "Request failed");
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
  organisation: { id: string; name: string };
}

export const auth = {
  signup: (data: {
    email: string;
    password: string;
    organisationName: string;
  }) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Products ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  organisation_id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  cost_price: number | null;
  selling_price: number | null;
  low_stock_threshold: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductPayload {
  name: string;
  sku: string;
  description?: string;
  quantity?: number;
  cost_price?: number | null;
  selling_price?: number | null;
  low_stock_threshold?: number | null;
}

export const products = {
  list: (q?: string) =>
    request<Product[]>(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`),

  get: (id: string) => request<Product>(`/products/${id}`),

  create: (data: ProductPayload) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductPayload>) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),

  adjustStock: (id: string, delta: number, note?: string) =>
    request<{ product: Product; note: string | null }>(
      `/products/${id}/stock`,
      {
        method: "PATCH",
        body: JSON.stringify({ delta, note }),
      },
    ),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardData {
  totalProducts: number;
  totalQuantity: number;
  lowStockItems: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    low_stock_threshold: number;
  }[];
}

export const dashboard = {
  get: () => request<DashboardData>("/dashboard"),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export interface Settings {
  id: string;
  name: string;
  default_low_stock_threshold: number;
}

export const settings = {
  get: () => request<Settings>("/settings"),
  update: (data: { default_low_stock_threshold: number }) =>
    request<Settings>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
