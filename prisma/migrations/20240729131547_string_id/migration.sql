/*
  Warnings:

  - The primary key for the `ReceiveChannel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelId` on the `ReceiveChannel` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `ReceiveChannel` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.
  - You are about to alter the column `serverId` on the `ReceiveChannel` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.
  - The primary key for the `SendChannel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelId` on the `SendChannel` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `SendChannel` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.
  - You are about to alter the column `serverId` on the `SendChannel` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.
  - The primary key for the `SendToReceive` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `sendChannelId` on the `SendToReceive` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.
  - You are about to alter the column `receiveChannelId` on the `SendToReceive` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.
  - The primary key for the `Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serverId` on the `Server` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Server` table. The data in that column could be lost. The data in that column will be cast from `UnsignedInt` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `ReceiveChannel` DROP FOREIGN KEY `ReceiveChannel_serverId_fkey`;

-- DropForeignKey
ALTER TABLE `SendChannel` DROP FOREIGN KEY `SendChannel_serverId_fkey`;

-- DropForeignKey
ALTER TABLE `SendToReceive` DROP FOREIGN KEY `SendToReceive_receiveChannelId_fkey`;

-- DropForeignKey
ALTER TABLE `SendToReceive` DROP FOREIGN KEY `SendToReceive_sendChannelId_fkey`;

-- DropIndex
DROP INDEX `ReceiveChannel_channelId_key` ON `ReceiveChannel`;

-- DropIndex
DROP INDEX `SendChannel_channelId_key` ON `SendChannel`;

-- DropIndex
DROP INDEX `Server_serverId_key` ON `Server`;

-- AlterTable
ALTER TABLE `ReceiveChannel` DROP PRIMARY KEY,
    DROP COLUMN `channelId`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `serverId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SendChannel` DROP PRIMARY KEY,
    DROP COLUMN `channelId`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `serverId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `SendToReceive` DROP PRIMARY KEY,
    MODIFY `sendChannelId` VARCHAR(191) NOT NULL,
    MODIFY `receiveChannelId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`sendChannelId`, `receiveChannelId`);

-- AlterTable
ALTER TABLE `Server` DROP PRIMARY KEY,
    DROP COLUMN `serverId`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `SendChannel` ADD CONSTRAINT `SendChannel_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceiveChannel` ADD CONSTRAINT `ReceiveChannel_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendToReceive` ADD CONSTRAINT `SendToReceive_sendChannelId_fkey` FOREIGN KEY (`sendChannelId`) REFERENCES `SendChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendToReceive` ADD CONSTRAINT `SendToReceive_receiveChannelId_fkey` FOREIGN KEY (`receiveChannelId`) REFERENCES `ReceiveChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
