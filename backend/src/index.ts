import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import settingsRoutes from "./routes/settings.routes";
import { authenticate } from "./middlewares/auth.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["https://stockflow-mvp-kappa.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", authenticate, productRoutes);
app.use("/api/dashboard", authenticate, dashboardRoutes);
app.use("/api/settings", authenticate, settingsRoutes);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
