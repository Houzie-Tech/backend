-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PROPERTY_OWNER';
ALTER TYPE "Role" ADD VALUE 'REAL_ESTATE_AGENT';
ALTER TYPE "Role" ADD VALUE 'FLAT_MATES';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyName" TEXT;
