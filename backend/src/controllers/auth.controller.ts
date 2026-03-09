import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import type { SignupInput, LoginInput } from "../schemas/auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "stockflow-dev-secret";

export const signup = async (req: Request, res: Response) => {
  const { email, password, organisationName } = req.body as SignupInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { user, organisation } = await prisma.$transaction(async (tx) => {
    const t = tx as unknown as typeof prisma;
    const organisation = await t.organisation.create({
      data: { name: organisationName },
    });
    const user = await t.user.create({
      data: { email, password_hash, organisation_id: organisation.id },
    });
    return { user, organisation };
  });

  const token = jwt.sign(
    { userId: user.id, organisationId: organisation.id },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email },
    organisation: { id: organisation.id, name: organisation.name },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organisation: true },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, organisationId: user.organisation_id },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: { id: user.id, email: user.email },
    organisation: { id: user.organisation.id, name: user.organisation.name },
  });
};


