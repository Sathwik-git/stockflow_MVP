import { z } from "zod";

export const updateSettingsSchema = z.object({
  default_low_stock_threshold: z
    .number({ error: "default_low_stock_threshold must be a number" })
    .int("Must be an integer")
    .nonnegative("Must be >= 0"),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
