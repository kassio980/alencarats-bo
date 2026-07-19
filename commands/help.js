const {EmbedBuilder}=require('discord.js');
const {CORES,PREFIX}=require('../config/config.js');
module.exports={name:'help',adminOnly:true,async execute(c,m){
  const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('COMANDOS').addFields({name:'GERAIS',value:'+veri, +puxa, +venda, +painel, +additem, +removeitem, +configpix'});
  m.reply({embeds:[e]});
}};