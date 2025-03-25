/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_resetToken_key" ON "UserAuth"("resetToken");
