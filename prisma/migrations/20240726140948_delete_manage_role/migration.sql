/*
  Warnings:

  - You are about to drop the `AdminRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AdminRole` DROP FOREIGN KEY `AdminRole_serverId_fkey`;

-- DropTable
DROP TABLE `AdminRole`;
