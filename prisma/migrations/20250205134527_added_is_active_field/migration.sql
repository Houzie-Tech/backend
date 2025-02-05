/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Amenities" AS ENUM ('OWNER_FREE', 'PET_FRIENDLY', 'COUPLE_FRIENDLY', 'BALCONY');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "Amenities" "Amenities"[],
ADD COLUMN     "Brokerage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "Security" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";
