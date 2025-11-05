/*
Warnings:

- A unique constraint covering the columns `[name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
- Made the column `description` on table `Team` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeamMembers"
DROP CONSTRAINT "_TeamMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeamMembers"
DROP CONSTRAINT "_TeamMembers_B_fkey";

-- AlterTable
ALTER TABLE "public"."PlayerAccount"
ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 1000,
ALTER COLUMN "description"
SET DEFAULT '',
ALTER COLUMN "primaryRole"
DROP NOT NULL,
ALTER COLUMN "secondaryRole"
DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Team"
ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "description"
SET NOT NULL,
ALTER COLUMN "description"
SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "public"."Team" ("name");

-- AddForeignKey
ALTER TABLE "public"."Team"
ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."PlayerAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TeamMembers"
ADD CONSTRAINT "_TeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."PlayerAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TeamMembers"
ADD CONSTRAINT "_TeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE;