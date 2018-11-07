const request = require('request');
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
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
            // !ping
            case 'who':
			var id;
			const channels = bot.channels;
			for(var c in channels)//each channel id in the server
			{ 		
				mems = bot.channels[c].members;   //each member in that channel
				for(var m in mems)
				{ 		
					logger.info(m + '-' + bot.users[m].username);      
				}
			}
            break;
            // Just add any case commands if you want to..
         }
     }
});