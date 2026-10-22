-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stock" INTEGER;

-- CreateTable
CREATE TABLE "store_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "default_delivery_charge_inside_dhaka" INTEGER NOT NULL DEFAULT 0,
    "default_delivery_charge_outside_dhaka" INTEGER NOT NULL DEFAULT 0,
    "whatsapp_number" TEXT NOT NULL DEFAULT '',
    "contact_phone" TEXT NOT NULL DEFAULT '',
    "contact_email" TEXT NOT NULL DEFAULT '',
    "contact_address" TEXT NOT NULL DEFAULT '',
    "announcement_text" TEXT NOT NULL DEFAULT '',
    "announcement_active" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
