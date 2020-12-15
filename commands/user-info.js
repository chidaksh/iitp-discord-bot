const {
	getAuthToken,
	getSpreadSheetValues,
	spreadsheetId,
	sheetName,
} = require('../services/googleSheetsService.js');
const Discord = require('discord.js');
const messageEmbed= new Discord.MessageEmbed();
// Id of the spreadsheet file (it is in the url of the google sheet)
const logThemes = require("../theme.js");


function convertCaseName(realname) {
	let name = realname.split(' ');
	let newName = [];

	function convert(item) {
		item = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
		newName.push(item);
	}

	name.forEach(convert);
	return newName.join(' ')
}


async function getDetails(message) {
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
	};
	console.log(`Finding match for ${message.author.tag}...`);
	for (var i in author_detail) {

		let discordUserNameTag = author_detail[i][0];
		if (discordUserNameTag == message.author.tag) {
			let realName = author_detail[i][1];
			realName = convertCaseName(realName);
			let rollNumber = author_detail[i][2];
			var house = author_detail[i][4];

			if (house === 'A') {
				house = 'Auriga';
			} else if (house === 'C') {
				house = 'Cassiopeia';
			} else if (house === 'P') {
				house = 'Pegasus';
			} else if (house === 'D') {
				house = 'Darco';
			}
			messageEmbed.setTitle(`Your Name is ${realName}\nYour Roll No is ${rollNumber}\nYour house is ${house}`)
						.setColor('ORANGE');
			message.channel.send(messageEmbed);
			// TODO Do not print the roll number
			// TODO Assign a role based on the roll number like give `role-a` if rollNumber starts with 1901
			return;
		}
	};
	messageEmbed.setTitle("Sorry we couldn't find you in our database. \
	Please ping"+ "<@&" + modRole.id + "> to identify you.")
				.setColor('RED');
	message.reply(messageEmbed);
	return;
}

module.exports = {
	name: 'user-info',
	description: 'Display info about yourself.',
	execute(message, args) {
		// console.log(`${message}\n${args.toString()}`);
		let userName = message.author.tag;
		// TODO Check for mentions in this command
		// If someone runs !user-info @dhushyanth in the message
		// then identify the mentioned user and fetch the
		// roll number of that user
		messageEmbed.setTitle(`Your username: ${userName}\n`)
					.setColor('GREEN');
		message.channel.send(messageEmbed);
		getDetails(message);
		// var role = message.guild.roles.find(role => role.name === "role-b");
		// message.member.addRole(role);
	}
};
