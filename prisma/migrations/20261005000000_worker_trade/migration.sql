-- CreateEnum
CREATE TYPE "Trade" AS ENUM ('PLUMBER', 'ELECTRICIAN', 'CARPENTER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "trade" "Trade";
