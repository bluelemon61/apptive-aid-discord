/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `ReceiveChannel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelId]` on the table `SendChannel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ReceiveChannel_channelId_key` ON `ReceiveChannel`(`channelId`);

-- CreateIndex
CREATE UNIQUE INDEX `SendChannel_channelId_key` ON `SendChannel`(`channelId`);
