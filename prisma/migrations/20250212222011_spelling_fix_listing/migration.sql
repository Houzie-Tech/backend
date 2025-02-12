/*
  Warnings:

  - You are about to drop the column `Brokerage` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `Security` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "Brokerage",
DROP COLUMN "Security",
ADD COLUMN     "brokerage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "security" DOUBLE PRECISION NOT NULL DEFAULT 0;
