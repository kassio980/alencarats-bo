const {ActionRowBuilder,ButtonBuilder,EmbedBuilder}=require('discord.js');
const {TICKETS,CORES}=require('../../config/config.js');
module.exports={name:'painel',adminOnly:true,async execute(c,m){
  const e=new EmbedBuilder().setColor(CORES.INFO).setTitle('ATENDIMENTO');
  const ls=[],l=new ActionRowBuilder();
  TICKETS.CATEGORIAS.forEach((x,i)=>{
    l.addComponents(new ButtonBuilder().setCustomId('ticket_'+x.nome).setLabel(x.nome).setStyle('Secondary').setEmoji(x.emoji));
    if((i+1)%5===0){ls.push(l);l=new ActionRowBuilder();}
  });
  if(l.components.length) ls.push(l);
  await m.delete().catch(()=>{}); m.channel.send({embeds:[e],components:ls});
}};