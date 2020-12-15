const {
	getAuthToken,
	getSpreadSheetValues,
	spreadsheetId,
	sheetName,
} = require('../services/googleSheetsService.js');
const Discord = require('discord.js');
const messageEmbed= new Discord.MessageEmbed();
async function assignRole(branch, gradYear, message) {
	let { cache } = message.guild.roles;
	let modRole = cache.find(role => role.name === "moderator");

	let yearRole = cache.find(role => role.name.includes(gradYear));
	if (!yearRole) {
		messageEmbed.setTitle("Year role could not be assigned. \
			Please ping"+ "<@&" + modRole.id + "> to identify you.")
					.setColor('RED');
		message.reply(messageEmbed);
	}
	else {
		await message.member.roles.add(yearRole);
	}
	let yearString = "Year role added\n";

	let branchRole = cache.find(role => role.name.includes(branch));
	if (!branchRole) {
		messageEmbed.setTitle("Branch role could not be assigned. \
		Please ping"+ "<@&" + modRole.id + "> to identify you.")
					.setColor('RED');
		message.reply(messageEmbed);
	}
	else {
		await message.member.roles.add(branchRole);
	}
	let branchString = "Branch role added\n";
	let messageString = branchString + yearString;
	return messageString;
}

async function getDetails(message, username) {
	let { cache } = message.guild.roles;
	let modRole = cache.find(role => role.name === "moderator");
	var author_detail = null;
	try {
		const auth = await getAuthToken();
		const details = await getSpreadSheetValues({
			spreadsheetId,
			sheetName,
			auth
		});
		author_detail = details.data.values;
	}
	catch (error) {
		console.log(error);
		return;
	};
	console.log(`Finding match for ${message.author.tag}`);

	for (var i in author_detail) {
		let discordUserNameTag = author_detail[i][0];

		if (discordUserNameTag == message.author.tag) {
			let realName = author_detail[i][1];

			let part = realName.split(" ")
			let lastName = part[part.length - 1];

			console.log(`real name ${realName}`);
			let rollNumber = author_detail[i][2];
			console.log(`roll no ${rollNumber}`);
			let branch = rollNumber.slice(4, 6);
			console.log(`branch ${branch}`);
			let rollYear = rollNumber.slice(0, 2);
			let gradYear = parseInt(rollYear);
			gradYear += 4;

			let messageString = await assignRole(branch, gradYear, message);
			try {
				if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) return message.reply('I\'m missing permissions.');
				if (message.author.id === message.guild.ownerID) return message.reply('I can\'t change your nickname.');

				await message.member.setNickname(`${username}-${part[0]} ${lastName}`);
				messageString += "Nickname Changed\n";
				messageEmbed.setTitle(messageString)
							.setColor('GOLD');
				message.reply(messageEmbed);
			} catch (err) {
				console.error(err);
			}
			// console.log(message.guild.roles);
			return;
		}
	}
	messageEmbed.setTitle("User not found")
				.setColor('RED');
	message.reply(messageEmbed);
	return;
}

module.exports = {
	name: 'verify',
	description: 'Changes nickname and roles',
	execute(message, args) {
		username = message.author.tag.split('#')[0];
		//  console.log(`user name is ${username}`);
		if (args[0] === "me") {
			getDetails(message, username);
		}
		else {
			messageEmbed.setTitle("The command you are looking for is-!verify me")
						.setColor('YELLOW');
			message.reply(messageEmbed);
		}
	}
}
