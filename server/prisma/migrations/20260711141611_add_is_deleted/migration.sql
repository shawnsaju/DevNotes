-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("content", "createdAt", "id", "isPinned", "tags", "title", "updatedAt", "userId") SELECT "content", "createdAt", "id", "isPinned", "tags", "title", "updatedAt", "userId" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
