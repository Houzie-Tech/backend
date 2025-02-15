-- AlterEnum
ALTER TYPE "Amenities" ADD VALUE 'GYM';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "furnishing" "Furnishing",
ADD COLUMN     "furnishingExtras" TEXT[];
