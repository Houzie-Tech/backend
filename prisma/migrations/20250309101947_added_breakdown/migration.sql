-- CreateEnum
CREATE TYPE "RoomFurnishingItem" AS ENUM ('AC', 'BED', 'MATTRESS', 'WARDROBE', 'STUDY_TABLE', 'CHAIR', 'GEYSER', 'EXHAUST');

-- CreateEnum
CREATE TYPE "HouseFurnishingItem" AS ENUM ('TV', 'FRIDGE', 'SOFA', 'DINING_TABLE', 'RO_WATER_PURIFIER');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "cookChargesPerPerson" DOUBLE PRECISION,
ADD COLUMN     "houseFurnishingItems" "HouseFurnishingItem"[],
ADD COLUMN     "maidChargesPerPerson" DOUBLE PRECISION,
ADD COLUMN     "otherMaintenanceCharges" DOUBLE PRECISION,
ADD COLUMN     "otherMaintenanceDetails" TEXT,
ADD COLUMN     "roomFurnishingItems" "RoomFurnishingItem"[],
ADD COLUMN     "wifiChargesPerPerson" DOUBLE PRECISION;
