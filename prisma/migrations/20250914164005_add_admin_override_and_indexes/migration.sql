-- CreateTable
CREATE TABLE "public"."AdminOverride" (
    "id" TEXT NOT NULL,
    "propertyExtId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminOverride_propertyExtId_key" ON "public"."AdminOverride"("propertyExtId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "public"."Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_checkin_idx" ON "public"."Booking"("checkin");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_purpose_idx" ON "public"."Payment"("purpose");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_dueAt_idx" ON "public"."Payment"("dueAt");
