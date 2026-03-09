import { z } from "zod";

const positiveFloat = z
  .number({ error: "Must be a number" })
  .nonnegative("Must be >= 0");
const nonNegativeInt = z
  .number({ error: "Must be a number" })
  .int("Must be an integer")
  .nonnegative("Must be >= 0");

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100)
    .regex(
      /^[A-Za-z0-9_\-]+$/,
      "SKU may only contain letters, numbers, hyphens, and underscores",
    ),
  description: z.string().max(1000).nullable().optional(),
  quantity: nonNegativeInt.optional().default(0),
  cost_price: positiveFloat.nullable().optional(),
  selling_price: positiveFloat.nullable().optional(),
  low_stock_threshold: nonNegativeInt.nullable().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[A-Za-z0-9_\-]+$/,
      "SKU may only contain letters, numbers, hyphens, and underscores",
    )
    .optional(),
  description: z.string().max(1000).nullable().optional(),
  quantity: nonNegativeInt.optional(),
  cost_price: positiveFloat.nullable().optional(),
  selling_price: positiveFloat.nullable().optional(),
  low_stock_threshold: nonNegativeInt.nullable().optional(),
});

export const adjustStockSchema = z.object({
  delta: z
    .number({ error: "delta must be a number" })
    .int("delta must be an integer"),
  note: z.string().max(500).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
