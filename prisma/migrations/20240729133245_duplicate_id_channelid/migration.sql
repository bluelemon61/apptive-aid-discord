/*
  Warnings:

  - The primary key for the `ReceiveChannel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ReceiveChannel` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `SendChannel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `SendChannel` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `SendToReceive` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `sendChannelId` on the `SendToReceive` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `receiveChannelId` on the `SendToReceive` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `channelId` to the `ReceiveChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channelId` to the `SendChannel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `SendToReceive` DROP FOREIGN KEY `SendToReceive_receiveChannelId_fkey`;

-- DropForeignKey
ALTER TABLE `SendToReceive` DROP FOREIGN KEY `SendToReceive_sendChannelId_fkey`;

-- AlterTable
ALTER TABLE `ReceiveChannel` DROP PRIMARY KEY,
    ADD COLUMN `channelId` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SendChannel` DROP PRIMARY KEY,
    ADD COLUMN `channelId` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SendToReceive` DROP PRIMARY KEY,
    MODIFY `sendChannelId` INTEGER NOT NULL,
    MODIFY `receiveChannelId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`sendChannelId`, `receiveChannelId`);

-- AddForeignKey
ALTER TABLE `SendToReceive` ADD CONSTRAINT `SendToReceive_sendChannelId_fkey` FOREIGN KEY (`sendChannelId`) REFERENCES `SendChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendToReceive` ADD CONSTRAINT `SendToReceive_receiveChannelId_fkey` FOREIGN KEY (`receiveChannelId`) REFERENCES `ReceiveChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
