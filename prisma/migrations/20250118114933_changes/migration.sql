/*
  Warnings:

  - You are about to drop the column `configuration` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `furnishing` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `lastContactedAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `moveInDate` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `nextFollowUpDate` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `rentFor` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the `LeadNote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LeadNote" DROP CONSTRAINT "LeadNote_leadId_fkey";

-- DropIndex
DROP INDEX "Lead_brokerId_status_priority_idx";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "configuration",
DROP COLUMN "furnishing",
DROP COLUMN "lastContactedAt",
DROP COLUMN "moveInDate",
DROP COLUMN "nextFollowUpDate",
DROP COLUMN "priority",
DROP COLUMN "rentFor",
DROP COLUMN "status";

-- DropTable
DROP TABLE "LeadNote";
