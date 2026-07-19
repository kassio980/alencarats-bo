const {ActionRowBuilder,ButtonBuilder,EmbedBuilder}=require('discord.js');
const {CORES}=require('../../config/config.js');
module.exports={name:'venda',adminOnly:true,async execute(c,m){
  const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('LOJA');
  const l=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('loja').setLabel('VER ITENS').setStyle('Primary'));
  await m.delete().catch(()=>{}); m.channel.send({embeds:[e],components:[l]});
}};