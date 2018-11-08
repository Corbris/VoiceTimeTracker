const request = require('request');
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var oldUsers = [];  //used to look at the past users in voice channel. This will tell us if they stayed or are new. 
var newUsers = [];
var jsonTest = require('./JSONtest.json');
var fs = require('fs');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

setInterval(function() {
const channels = bot.channels;//ALL channels the bot is linked to. 
			for(var cid in channels) //cid = channel ID
			{ 	
				if(bot.channels[cid].name != 'AFK')
				{
					var mems = bot.channels[cid].members;   //each member collection in that channel
					for(var mid in mems)  //mid = member ID
					{ 		
						newUsers.push(mid);  //array of user IDS
						for(var old in oldUsers) //for each user in oldUsers
						{
							if(mid == oldUsers[old])  //we need to ++TIME
							{
								inJSON = 0;
								for(var l=0; l<jsonTest.userList.length; l++) //loop JSON file
								{
									if(mid == jsonTest.userList[l].ID)  //found in the JSON
									{
										inJSON = 1; //found in JSON
										jsonTest.userList[l].Name = bot.users[mid].username; //update name if it changes
										jsonTest.userList[l].Time++; //increase time
										logger.info(bot.users[mid].username + ' ' + jsonTest.userList[l].Time); 
									}
								}
								//adding user to JSON and setting time at 1;
								if(inJSON == 0)
								{
									var pushUser = {"ID":mid,"Name":bot.users[mid].username,"Time":1,"Messages":0};
									jsonTest.userList.push(pushUser);
								}
							}
						}
					}
				}
			}
			oldUsers = [];
			oldUsers = newUsers.slice();
			newUsers = [];
			fs.writeFile('./JSONtest.json', JSON.stringify(jsonTest), function (err) {if (err) return console.log(err);}); //write to JSON

}, 10 *60 * 1000); // Check every 10 min


bot.on('message', function (user, userID, channelID, message, evt) 
{

	//track each message for these users. if not in JSON add them-----------------------------------------------------
	var inJSON;
	for(var user in jsonTest.userList) //loop JSON file
	{
		if(userID == jsonTest.userList[user].ID)  //found in the JSON
		{
			inJSON =1;
			jsonTest.userList[user].Messages++;
		}
	}
	if(inJSON == 0) //add user to JSON
	{
		var pushUser = {"ID":userID,"Name":bot.users[userID].username,"Time":0,"Messages":1};
	}
	fs.writeFile('./JSONtest.json', JSON.stringify(jsonTest), function (err) {if (err) return console.log(err);});
	//-------------------------------------------------------------------------------------------------------------
	
	
	if (message.substring(0, 1) == '!') 
	{
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        switch(cmd) {
			
			case 'time':
				for(var l=0; l<jsonTest.userList.length; l++)
				{
				    if(userID == jsonTest.userList[l].ID)
					{
						var reply = 'User ' + jsonTest.userList[l].Name + ' has been in a voice channel for a total of ' + jsonTest.userList[l].Time*10 + ' minutes';
						logger.info(reply);
						bot.sendMessage({to: channelID, message: reply });
					}
				}
			break;
			
			case 'messages':
				for(var l=0; l<jsonTest.userList.length; l++)
				{
				    if(userID == jsonTest.userList[l].ID)
					{
						var reply = 'User ' + jsonTest.userList[l].Name + ' has sent a total of ' + jsonTest.userList[l].Messages + ' messages';
						logger.info(reply);
						bot.sendMessage({to: channelID, message: reply });
					}
				}
			break;
			
			
			case 'level':
				for(var l=0; l<jsonTest.userList.length; l++)
				{
				    if(userID == jsonTest.userList[l].ID)
					{
						var timeXP = jsonTest.userList[l].Time*10;  //10 min of time is equal to 5 xp
						var messageXP = jsonTest.userList[l].Messages*8;  //a single message is 8 xp
						var totalXP = timeXP + messageXP;
						var level = Math.sqrt(totalXP) / 6;
						level = Math.floor(level);
						//XP = parseInt(XP,10)
						//var level = XP;
						var reply = 'Users XP is ' + totalXP + ' and is level ' + level;
						logger.info(reply);
						bot.sendMessage({to: channelID, message: reply });
					}
				}
			break;
			
			case 'help':
				var reply = '**CorbBot Commands** \n\n' +
				'__*!time*__ \nReturns the amount of time you have spent in voice channels \n\n' +
				'__*!messages*__ \nReturns the total number of messages sent \n\n' +
				'__*!level*__ \nReturns user XP and level \n\n' + 
				'__*XP System*__ \n10 minutes of voice chat is 5 XP \n' +
				'1 message in chat is 8 XP \n' +
				'levels is calculated by (root(voiceTime/2 + messages*8))/6';
				bot.sendMessage({to: channelID, message: reply });
			break;

        }
    }
});
