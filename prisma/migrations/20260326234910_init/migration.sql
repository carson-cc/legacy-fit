-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" DATETIME,
    CONSTRAINT "Job_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "dominance" REAL NOT NULL,
    "extraversion" REAL NOT NULL,
    "patience" REAL NOT NULL,
    "formality" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobTarget_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "sentAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateInvite_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "scoringVersion" TEXT NOT NULL DEFAULT 'v1.0.0',
    "rushed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentResult_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "CandidateInvite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlacementOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inviteId" TEXT NOT NULL,
    "placed" BOOLEAN NOT NULL,
    "retainedAt90" BOOLEAN,
    "retainedAt180" BOOLEAN,
    "performanceRating" INTEGER,
    "notes" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlacementOutcome_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "CandidateInvite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JobTarget_jobId_key" ON "JobTarget"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateInvite_token_key" ON "CandidateInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResult_inviteId_key" ON "AssessmentResult"("inviteId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementOutcome_inviteId_key" ON "PlacementOutcome"("inviteId");
