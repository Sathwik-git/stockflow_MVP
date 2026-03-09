import { Request, Response } from "express";
import prisma from "../db/prisma";
import type {
  CreateProductInput,
  UpdateProductInput,
  AdjustStockInput,
} from "../schemas/product.schema";

export const listProducts = async (req: Request, res: Response) => {
  const { q } = req.query;
  const organisationId = req.user!.organisationId;

  const products = await prisma.product.findMany({
    where: {
      organisation_id: organisationId,
      ...(q
        ? {
            OR: [
              { name: { contains: String(q), mode: "insensitive" } },
              { sku: { contains: String(q), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { created_at: "desc" },
  });

  res.json(products);
};

export const createProduct = async (req: Request, res: Response) => {
  const organisationId = req.user!.organisationId;
  const {
    name,
    sku,
    description,
    quantity,
    cost_price,
    selling_price,
    low_stock_threshold,
  } = req.body as CreateProductInput;

  const existing = await prisma.product.findFirst({
    where: { organisation_id: organisationId, sku },
  });
  if (existing) {
    res.status(409).json({
      error: "A product with this SKU already exists in your organisation",
    });
    return;
  }

  const product = await prisma.product.create({
    data: {
      organisation_id: organisationId,
      name,
      sku,
      description: description ?? null,
      quantity: quantity ?? 0,
      cost_price: cost_price ?? null,
      selling_price: selling_price ?? null,
      low_stock_threshold: low_stock_threshold ?? null,
    },
  });

  res.status(201).json(product);
};

export const getProduct = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const organisationId = req.user!.organisationId;

  const product = await prisma.product.findFirst({
    where: { id, organisation_id: organisationId },
  });

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const organisationId = req.user!.organisationId;

  const existing = await prisma.product.findFirst({
    where: { id, organisation_id: organisationId },
  });

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const {
    name,
    sku,
    description,
    quantity,
    cost_price,
    selling_price,
    low_stock_threshold,
  } = req.body as UpdateProductInput;

  if (sku && sku !== existing.sku) {
    const skuConflict = await prisma.product.findFirst({
      where: { organisation_id: organisationId, sku, id: { not: id } },
    });
    if (skuConflict) {
      res
        .status(409)
        .json({ error: "Another product with this SKU already exists" });
      return;
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(sku !== undefined && { sku }),
      ...(description !== undefined && { description }),
      ...(quantity !== undefined && { quantity }),
      ...(cost_price !== undefined && { cost_price }),
      ...(selling_price !== undefined && { selling_price }),
      ...(low_stock_threshold !== undefined && { low_stock_threshold }),
    },
  });

  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const organisationId = req.user!.organisationId;

  const existing = await prisma.product.findFirst({
    where: { id, organisation_id: organisationId },
  });

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  await prisma.product.delete({ where: { id } });

  res.json({ message: "Product deleted successfully" });
};

export const adjustStock = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const organisationId = req.user!.organisationId;
  const { delta, note } = req.body as AdjustStockInput;

  const existing = await prisma.product.findFirst({
    where: { id, organisation_id: organisationId },
  });

  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const newQuantity = existing.quantity + delta;
  if (newQuantity < 0) {
    res.status(400).json({ error: "Resulting quantity cannot be negative" });
    return;
  }

  const product = await prisma.product.update({
    where: { id },
    data: { quantity: newQuantity },
  });

  res.json({ product, note: note ?? null });
};
