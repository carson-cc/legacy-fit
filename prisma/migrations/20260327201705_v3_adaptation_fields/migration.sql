-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssessmentResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shareToken" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "dominance" REAL NOT NULL,
    "extraversion" REAL NOT NULL,
    "patience" REAL NOT NULL,
    "formality" REAL NOT NULL,
    "domPercentile" REAL NOT NULL,
    "extPercentile" REAL NOT NULL,
    "patPercentile" REAL NOT NULL,
    "forPercentile" REAL NOT NULL,
    "profileName" TEXT NOT NULL,
    "profileGroup" TEXT NOT NULL,
    "secondaryProfile" TEXT,
    "adaptationStress" REAL NOT NULL,
    "fitPct" INTEGER,
    "list1Responses" TEXT NOT NULL,
    "list2Responses" TEXT NOT NULL,
    "list1Order" TEXT NOT NULL,
    "list2Order" TEXT NOT NULL,
    "list1Count" INTEGER NOT NULL,
    "list2Count" INTEGER NOT NULL,
    "timeOnPage1Ms" INTEGER,
    "timeOnPage2Ms" INTEGER,
    "domAdaptation" REAL,
    "extAdaptation" REAL,
    "patAdaptation" REAL,
    "forAdaptation" REAL,
    "fitLow" INTEGER,
    "fitHigh" INTEGER,
    "scoringVersion" TEXT NOT NULL DEFAULT 'v3.0.0',
    "scoringVariant" TEXT NOT NULL DEFAULT 'v2_quadratic',
    "rushed" BOOLEAN NOT NULL DEFAULT false,
    "recruiterNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentResult_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "CandidateInvite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AssessmentResult" ("adaptationStress", "createdAt", "domPercentile", "dominance", "extPercentile", "extraversion", "fitPct", "forPercentile", "formality", "id", "inviteId", "list1Count", "list1Order", "list1Responses", "list2Count", "list2Order", "list2Responses", "patPercentile", "patience", "profileGroup", "profileName", "recruiterNotes", "rushed", "scoringVariant", "scoringVersion", "secondaryProfile", "shareToken", "timeOnPage1Ms", "timeOnPage2Ms") SELECT "adaptationStress", "createdAt", "domPercentile", "dominance", "extPercentile", "extraversion", "fitPct", "forPercentile", "formality", "id", "inviteId", "list1Count", "list1Order", "list1Responses", "list2Count", "list2Order", "list2Responses", "patPercentile", "patience", "profileGroup", "profileName", "recruiterNotes", "rushed", "scoringVariant", "scoringVersion", "secondaryProfile", "shareToken", "timeOnPage1Ms", "timeOnPage2Ms" FROM "AssessmentResult";
DROP TABLE "AssessmentResult";
ALTER TABLE "new_AssessmentResult" RENAME TO "AssessmentResult";
CREATE UNIQUE INDEX "AssessmentResult_shareToken_key" ON "AssessmentResult"("shareToken");
CREATE UNIQUE INDEX "AssessmentResult_inviteId_key" ON "AssessmentResult"("inviteId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'recruiter',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password") SELECT "createdAt", "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
