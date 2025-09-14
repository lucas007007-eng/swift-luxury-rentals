-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'other',
ADD COLUMN     "refundedAt" TIMESTAMP(3);
