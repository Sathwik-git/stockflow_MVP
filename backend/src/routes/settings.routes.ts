import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateSettingsSchema } from "../schemas/settings.schema";

const router = Router();


router.get("/", getSettings);
router.put("/", validate(updateSettingsSchema), updateSettings);

export default router;
