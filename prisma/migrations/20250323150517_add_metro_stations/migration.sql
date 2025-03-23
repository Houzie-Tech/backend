-- CreateTable
CREATE TABLE "MetroStation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Gurgaon',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetroStation_pkey" PRIMARY KEY ("id")
);
