-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "tokenCreatedAt" TIMESTAMP(3);
