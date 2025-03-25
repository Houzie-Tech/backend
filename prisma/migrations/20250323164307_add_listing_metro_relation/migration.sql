-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "metroStationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_metroStationId_fkey" FOREIGN KEY ("metroStationId") REFERENCES "MetroStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
