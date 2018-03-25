CREATE TABLE `users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`password` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `courses` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL AUTO_INCREMENT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `courseUserInfo` (
	`uId` INT NOT NULL,
	`cId` INT NOT NULL,
	`ambition` VARCHAR(255) NOT NULL,
	`seeking` VARCHAR(255) NOT NULL,
	`biography` VARCHAR(255) NOT NULL,
	`numberOfMatches` INT NOT NULL,
	PRIMARY KEY (`uId`,`cId`)
);

CREATE TABLE `matches` (
	`cId` INT NOT NULL,
	`uId1` INT NOT NULL,
	`uId2` INT NOT NULL,
	`totalMessages` INT NOT NULL,
	PRIMARY KEY (`cId`,`uId1`,`uId2`)
);

CREATE TABLE `userLikes` (
	`uId1` INT NOT NULL,
	`uId2` INT NOT NULL,
	`cId` INT NOT NULL,
	PRIMARY KEY (`uId1`,`uId2`,`cId`)
);

CREATE TABLE `messages` (
	`from` INT NOT NULL,
	`to` INT NOT NULL,
	`cId` INT NOT NULL,
	`message` VARCHAR(255) NOT NULL,
	`messageNumber` INT NOT NULL,
	PRIMARY KEY (`from`,`to`,`cId`)
);
