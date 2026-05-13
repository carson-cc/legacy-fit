-- AlterTable
ALTER TABLE "CandidateInvite" ADD COLUMN     "demographicsConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CandidateDemographics" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "gender" TEXT,
    "race" TEXT,
    "ageRange" TEXT,
    "disability" TEXT,
    "veteran" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateDemographics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateDemographics_inviteId_key" ON "CandidateDemographics"("inviteId");

-- CreateIndex
CREATE INDEX "CandidateDemographics_inviteId_idx" ON "CandidateDemographics"("inviteId");

-- AddForeignKey
ALTER TABLE "CandidateDemographics" ADD CONSTRAINT "CandidateDemographics_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "CandidateInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
