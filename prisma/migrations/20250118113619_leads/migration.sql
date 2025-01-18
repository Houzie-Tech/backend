/*
  Warnings:

  - The `status` column on the `Listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `bathrooms` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bedrooms` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `configuration` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `furnishing` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('INDEPENDENT_HOUSE', 'VILLA', 'PLOT', 'BUILDER_FLOOR', 'FLAT_APARTMENT', 'CO_LIVING', 'PG');

-- CreateEnum
CREATE TYPE "Furnishing" AS ENUM ('NONE', 'FULLY_FURNISHED', 'SEMI_FURNISHED');

-- CreateEnum
CREATE TYPE "RentFor" AS ENUM ('BACHELOR', 'FAMILY');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOWUP', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'CONVERTED', 'LOST', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('DIRECT', 'REFERRAL', 'WEBSITE', 'SOCIAL_MEDIA', 'PROPERTY_PORTAL', 'OTHER');

-- DropIndex
DROP INDEX "Listing_brokerId_idx";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "bathrooms" INTEGER NOT NULL,
ADD COLUMN     "bedrooms" INTEGER NOT NULL,
ADD COLUMN     "configuration" TEXT NOT NULL,
ADD COLUMN     "furnishing" "Furnishing" NOT NULL,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
ADD COLUMN     "rentFor" "RentFor"[] DEFAULT ARRAY[]::"RentFor"[],
DROP COLUMN "status",
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "RentDetails" (
    "id" TEXT NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "RentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellDetails" (
    "id" TEXT NOT NULL,
    "askingPrice" DOUBLE PRECISION NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "SellDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "budgetMin" DOUBLE PRECISION NOT NULL,
    "budgetMax" DOUBLE PRECISION NOT NULL,
    "preferredLocations" TEXT[],
    "propertyTypes" "PropertyType"[],
    "configuration" TEXT[],
    "furnishing" "Furnishing"[],
    "rentFor" "RentFor",
    "moveInDate" TIMESTAMP(3),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpDate" TIMESTAMP(3),
    "requirements" TEXT,
    "brokerId" TEXT NOT NULL,
    "source" "LeadSource" NOT NULL DEFAULT 'DIRECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentDetails_listingId_key" ON "RentDetails"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "SellDetails_listingId_key" ON "SellDetails"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_phoneNumber_key" ON "Lead"("phoneNumber");

-- CreateIndex
CREATE INDEX "Lead_brokerId_status_priority_idx" ON "Lead"("brokerId", "status", "priority");

-- CreateIndex
CREATE INDEX "Lead_phoneNumber_idx" ON "Lead"("phoneNumber");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_idx" ON "LeadNote"("leadId");

-- CreateIndex
CREATE INDEX "Listing_price_locationId_idx" ON "Listing"("price", "locationId");

-- AddForeignKey
ALTER TABLE "RentDetails" ADD CONSTRAINT "RentDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellDetails" ADD CONSTRAINT "SellDetails_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
