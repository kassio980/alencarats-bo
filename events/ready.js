const chalk = require('chalk');
const {ActivityType} = require('discord.js');
module.exports = async c => {
  console.log('CONECTADO COMO: '+c.user.tag);
  c.user.setActivity({name:'Alencararts | +help',type:ActivityType.Streaming,url:'https://twitch.tv/alencararts'});
};