-- CreateTable
CREATE TABLE `Server` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminRole` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverId` INTEGER UNSIGNED NOT NULL,
    `roleId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SendChannel` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverId` INTEGER UNSIGNED NOT NULL,
    `channelId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReceiveChannel` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `serverId` INTEGER UNSIGNED NOT NULL,
    `channelId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SendToReceive` (
    `sendChannelId` INTEGER UNSIGNED NOT NULL,
    `receiveChannelId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`sendChannelId`, `receiveChannelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminRole` ADD CONSTRAINT `AdminRole_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendChannel` ADD CONSTRAINT `SendChannel_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceiveChannel` ADD CONSTRAINT `ReceiveChannel_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendToReceive` ADD CONSTRAINT `SendToReceive_sendChannelId_fkey` FOREIGN KEY (`sendChannelId`) REFERENCES `SendChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SendToReceive` ADD CONSTRAINT `SendToReceive_receiveChannelId_fkey` FOREIGN KEY (`receiveChannelId`) REFERENCES `ReceiveChannel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
