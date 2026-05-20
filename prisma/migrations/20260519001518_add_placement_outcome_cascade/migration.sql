-- AlterTable: drop and re-add PlacementOutcome FK with CASCADE delete
ALTER TABLE "PlacementOutcome" DROP CONSTRAINT "PlacementOutcome_inviteId_fkey";
ALTER TABLE "PlacementOutcome" ADD CONSTRAINT "PlacementOutcome_inviteId_fkey"
  FOREIGN KEY ("inviteId") REFERENCES "CandidateInvite"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
