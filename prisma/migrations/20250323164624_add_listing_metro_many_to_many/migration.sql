/*
  Warnings:

  - You are about to drop the column `metroStationId` on the `Listing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_metroStationId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "metroStationId";

-- CreateTable
CREATE TABLE "ListingMetroStation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "metroStationId" INTEGER NOT NULL,
    "distanceInKm" DOUBLE PRECISION NOT NULL,
    "walkingTimeMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingMetroStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingMetroStation_listingId_idx" ON "ListingMetroStation"("listingId");

-- CreateIndex
CREATE INDEX "ListingMetroStation_metroStationId_idx" ON "ListingMetroStation"("metroStationId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingMetroStation_listingId_metroStationId_key" ON "ListingMetroStation"("listingId", "metroStationId");

-- AddForeignKey
ALTER TABLE "ListingMetroStation" ADD CONSTRAINT "ListingMetroStation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMetroStation" ADD CONSTRAINT "ListingMetroStation_metroStationId_fkey" FOREIGN KEY ("metroStationId") REFERENCES "MetroStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
