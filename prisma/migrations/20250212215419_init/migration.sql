-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BROKER', 'RENTER');

-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('EMAIL', 'PHONE');

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

-- CreateEnum
CREATE TYPE "Amenities" AS ENUM ('WIFI', 'TWO_WHEELER_PARKING', 'FOUR_WHEELER_PARKING', 'WATER_SUPPLY_24_7', 'POWER_BACKUP', 'SECURITY_24_7', 'CCTV', 'DAILY_HOUSEKEEPING', 'MEALS');

-- CreateEnum
CREATE TYPE "Features" AS ENUM ('COUPLE_FRIENDLY', 'PET_FRIENDLY', 'OWNER_FREE', 'ATTACHED_BATHROOM', 'GATED_COMMUNITY');

-- CreateEnum
CREATE TYPE "SharingType" AS ENUM ('SINGLE', 'SHARED', 'DOUBLE_SHARING', 'TRIPLE_SHARING');

-- CreateEnum
CREATE TYPE "Configuration" AS ENUM ('ONE_RK', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'FOUR_PLUS_BHK');

-- CreateEnum
CREATE TYPE "PreferredTenant" AS ENUM ('FAMILY', 'BACHELOR', 'COMPANY_LEASE', 'ANY');

-- CreateEnum
CREATE TYPE "LockInPeriod" AS ENUM ('FIFTEEN_DAYS', 'ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "aadharNumber" TEXT,
    "role" "Role" NOT NULL,
    "privacySetting" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" TEXT NOT NULL,
    "password" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT,
    "providerId" TEXT,
    "accessToken" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OTPType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAuthId" TEXT,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAuthId" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "mainImage" TEXT,
    "photos" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPreoccupied" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL,
    "Security" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Brokerage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "lockInPeriod" "LockInPeriod",
    "availableFrom" TIMESTAMP(3),
    "configuration" "Configuration",
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "balconies" INTEGER,
    "floorNumber" TEXT,
    "totalFloors" INTEGER,
    "maintenanceCharges" DOUBLE PRECISION,
    "isMaintenanceIncluded" BOOLEAN NOT NULL DEFAULT true,
    "roomType" TEXT,
    "sharingType" "SharingType",
    "unitsAvailable" INTEGER,
    "roomSize" DOUBLE PRECISION,
    "amenities" "Amenities"[],
    "features" "Features"[],
    "preferredTenant" "PreferredTenant",
    "locationId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "budgetMin" DOUBLE PRECISION NOT NULL,
    "budgetMax" DOUBLE PRECISION NOT NULL,
    "preferredLocations" TEXT[],
    "propertyTypes" "PropertyType"[],
    "requirements" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "listingId" TEXT,
    "brokerId" TEXT NOT NULL,
    "source" "LeadSource" NOT NULL DEFAULT 'DIRECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_aadharNumber_key" ON "User"("aadharNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_providerId_key" ON "UserAuth"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_key" ON "UserAuth"("userId");

-- CreateIndex
CREATE INDEX "UserAuth_provider_providerId_idx" ON "UserAuth"("provider", "providerId");

-- CreateIndex
CREATE INDEX "OTP_userAuthId_idx" ON "OTP"("userAuthId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userAuthId_idx" ON "RefreshToken"("userAuthId");

-- CreateIndex
CREATE INDEX "Listing_price_locationId_idx" ON "Listing"("price", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_latitude_longitude_key" ON "Location"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_phoneNumber_key" ON "Lead"("phoneNumber");

-- CreateIndex
CREATE INDEX "Lead_phoneNumber_idx" ON "Lead"("phoneNumber");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userAuthId_fkey" FOREIGN KEY ("userAuthId") REFERENCES "UserAuth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userAuthId_fkey" FOREIGN KEY ("userAuthId") REFERENCES "UserAuth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
