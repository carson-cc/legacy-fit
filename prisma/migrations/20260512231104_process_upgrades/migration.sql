/*
  Warnings:

  - You are about to drop the column `recruiterNotes` on the `AssessmentResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssessmentResult" DROP COLUMN "recruiterNotes";

-- AlterTable
ALTER TABLE "CandidateInvite" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedByUserId" TEXT,
ADD COLUMN     "approvedForClient" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CandidateNote" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateNote_inviteId_idx" ON "CandidateNote"("inviteId");

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "CandidateInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
