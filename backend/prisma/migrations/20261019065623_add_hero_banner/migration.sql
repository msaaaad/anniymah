-- CreateTable
CREATE TABLE "hero_banners" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL,
    "cta_label" TEXT NOT NULL DEFAULT '',
    "cta_url" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_banners_active_idx" ON "hero_banners"("active");
