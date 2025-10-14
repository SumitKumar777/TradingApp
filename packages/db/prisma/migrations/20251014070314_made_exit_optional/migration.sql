-- AlterTable
ALTER TABLE "Orders" ALTER COLUMN "exitPrice" DROP NOT NULL,
ALTER COLUMN "closingReason" SET DEFAULT 'Automatic';
