-- CreateEnum
CREATE TYPE "delivery_zone" AS ENUM ('inside_dhaka', 'outside_dhaka');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled', 'rejected');

-- CreateTable
CREATE TABLE "landing_pages" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL DEFAULT 0,
    "regular_price" INTEGER NOT NULL DEFAULT 0,
    "phone" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL DEFAULT '',
    "collection_enabled" BOOLEAN NOT NULL DEFAULT false,
    "collection_title" TEXT NOT NULL DEFAULT '',
    "collection_items" JSONB NOT NULL DEFAULT '[]',
    "features_enabled" BOOLEAN NOT NULL DEFAULT false,
    "features_title" TEXT NOT NULL DEFAULT '',
    "features_subtitle" TEXT NOT NULL DEFAULT '',
    "features" JSONB NOT NULL DEFAULT '[]',
    "shipping_bar_enabled" BOOLEAN NOT NULL DEFAULT false,
    "shipping_bar_items" JSONB NOT NULL DEFAULT '[]',
    "free_delivery" BOOLEAN NOT NULL DEFAULT true,
    "delivery_charge_inside_dhaka" INTEGER NOT NULL DEFAULT 0,
    "delivery_charge_outside_dhaka" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "landing_page_id" UUID,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "delivery_zone" "delivery_zone",
    "delivery_charge" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "courier_tracking_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_landing_page_id_fkey" FOREIGN KEY ("landing_page_id") REFERENCES "landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
