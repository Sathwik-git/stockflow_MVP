import { Router } from "express";
import {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} from "../controllers/product.controller";

import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} from "../schemas/product.schema";

const router = Router();


router.get("/", listProducts);
router.post("/", validate(createProductSchema), createProduct);
router.get("/:id", getProduct);
router.put("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/stock", validate(adjustStockSchema), adjustStock);

export default router;
