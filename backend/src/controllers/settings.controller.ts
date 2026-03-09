import { Request, Response } from "express";
import prisma from "../db/prisma";
import type { UpdateSettingsInput } from "../schemas/settings.schema";

export const getSettings = async (req: Request, res: Response) => {
  const organisationId = req.user!.organisationId;

  const org = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: { id: true, name: true, default_low_stock_threshold: true },
  });

  if (!org) {
    res.status(404).json({ error: "Organisation not found" });
    return;
  }

  res.json(org);
};

export const updateSettings = async (req: Request, res: Response) => {
  const organisationId = req.user!.organisationId;
  const { default_low_stock_threshold } = req.body as UpdateSettingsInput;

  const org = await prisma.organisation.update({
    where: { id: organisationId },
    data: { default_low_stock_threshold },
    select: { id: true, name: true, default_low_stock_threshold: true },
  });

  res.json(org);
};
