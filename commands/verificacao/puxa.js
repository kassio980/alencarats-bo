const {ActionRowBuilder,ButtonBuilder,EmbedBuilder,ModalBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
const {CORES}=require('../../config/config.js');
module.exports={name:'puxa',adminOnly:true,async execute(c,m){
  const q=c.db.prepare('SELECT COUNT(*) as t FROM verificados').get();
  const e=new EmbedBuilder().setColor(CORES.SUCESSO).setTitle('PUXAR MEMBROS').setDescription('TOTAL: '+q.t);
  const b=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('abrir_puxa').setLabel('INICIAR').setStyle(ButtonStyle.Success));
  await m.delete().catch(()=>{});
  const msg=await m.channel.send({embeds:[e],components:[b]});
  msg.createMessageComponentCollector({time:300000}).on('collect',async i=>{
    const modal=new ModalBuilder().setCustomId('modal_puxa').setTitle('DADOS').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('qtd').setLabel('QUANTIDADE').setStyle(TextInputStyle.Short).setRequired(true)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('convite').setLabel('LINK CONVITE').setStyle(TextInputStyle.Short).setRequired(true)));
    await i.showModal(modal);
  });
}};