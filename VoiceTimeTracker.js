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


bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') 
	{
        var args = message.substring(1).split(' ');
        var cmd = args[0];
		

        switch(cmd) 
		{
            case 'who':

			const channels = bot.channels;//ALL channels the bot is linked to. 
			for(var cid in channels)//each channel id in the server
			{ 	
				var mems = bot.channels[cid].members;   //each member collection in that channel
				for(var mid in mems)
				{ 		
					newUsers.push(mid);  //array of user IDS
					for(var old in oldUsers)
					{
						if(mid == oldUsers[old])  //we need to ++TIME
						{
							//FIND in JSON
							logger.info(bot.users[mid].username + ' ' + mid + ' - found in old ++Time'); 
							var inJSON = 0;
							for(var l=0; l<jsonTest.userList.length; l++)
							{
								if(mid == jsonTest.userList[l].ID)  //found in the JSON
								{
									inJSON = 1; //found in JSON
									jsonTest.userList[l].Name = bot.users[mid].username; //update name if it changes
									jsonTest.userList[l].Time++;
									logger.info(bot.users[mid].username + ' ' + jsonTest.userList[l].Time);
								}
							}
							//need a not found then add to JSON
							if(inJSON == 0)
							{
								var pushUser = {"ID":mid,"Name":bot.users[mid].username,"Time":1,"Messages":0};
								jsonTest.userList.push(pushUser);
							}

						}
					}

				}
				
			}
			oldUsers = [];
			oldUsers = newUsers.slice();
			newUsers = [];
			fs.writeFile('./JSONtest.json', JSON.stringify(jsonTest), function (err) {if (err) return console.log(err);}); //write to JSON
			
            break;
            // Just add any case commands if you want to..
         }
     }
});