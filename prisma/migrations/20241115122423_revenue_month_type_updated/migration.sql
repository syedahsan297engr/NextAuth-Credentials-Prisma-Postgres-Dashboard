/*
  Warnings:

  - The primary key for the `revenue` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "revenue" DROP CONSTRAINT "revenue_pkey",
ALTER COLUMN "month" SET DATA TYPE TEXT,
ADD CONSTRAINT "revenue_pkey" PRIMARY KEY ("month");
