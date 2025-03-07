-- CreateTable
CREATE TABLE "Occupant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "profession" TEXT NOT NULL,
    "about" TEXT,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occupant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Occupant_listingId_idx" ON "Occupant"("listingId");

-- AddForeignKey
ALTER TABLE "Occupant" ADD CONSTRAINT "Occupant_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
