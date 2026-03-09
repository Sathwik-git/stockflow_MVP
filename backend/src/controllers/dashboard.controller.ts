import { Request, Response } from "express";
import prisma from "../db/prisma";
import type { Organisation, Product } from "../generated/prisma/client";

export const getDashboard = async (req: Request, res: Response) => {
  const organisationId = req.user!.organisationId;

  const [org, products]: [Organisation | null, Product[]] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: organisationId } }),
    prisma.product.findMany({ where: { organisation_id: organisationId } }),
  ]);

  const globalThreshold = org?.default_low_stock_threshold ?? 5;

  const totalProducts = products.length;
  const totalQuantity = products.reduce(
    (sum: number, p) => sum + p.quantity,
    0,
  );

  const lowStockItems = products
    .filter((p) => {
      const threshold = p.low_stock_threshold ?? globalThreshold;
      return p.quantity <= threshold;
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      low_stock_threshold: p.low_stock_threshold ?? globalThreshold,
    }));

  res.json({ totalProducts, totalQuantity, lowStockItems });
};
