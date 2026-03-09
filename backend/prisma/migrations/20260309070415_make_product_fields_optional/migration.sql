-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "cost_price" DROP NOT NULL,
ALTER COLUMN "selling_price" DROP NOT NULL,
ALTER COLUMN "low_stock_threshold" DROP NOT NULL;
