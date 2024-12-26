/*
  Warnings:

  - You are about to drop the column `address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address",
ADD COLUMN     "addressOrder" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "address",
ADD COLUMN     "addressPayment" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressUser" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "active" SET DEFAULT false;
