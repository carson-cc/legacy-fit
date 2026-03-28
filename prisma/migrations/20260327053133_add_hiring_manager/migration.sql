-- CreateTable
CREATE TABLE "HiringManagerAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "dominance" REAL NOT NULL DEFAULT 0,
    "extraversion" REAL NOT NULL DEFAULT 0,
    "patience" REAL NOT NULL DEFAULT 0,
    "formality" REAL NOT NULL DEFAULT 0,
    "profileType" TEXT NOT NULL DEFAULT '',
    "token" TEXT NOT NULL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HiringManagerAssessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "HiringManagerAssessment_token_key" ON "HiringManagerAssessment"("token");
