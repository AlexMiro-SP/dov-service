/*
  Warnings:

  - Made the column `title` on table `snippet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "snippet" ALTER COLUMN "title" SET NOT NULL;
