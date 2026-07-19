const {ModalBuilder,ActionRowBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
module.exports={name:'additem',adminOnly:true,async execute(c,m){
  const modal=new ModalBuilder().setCustomId('modal_additem').setTitle('ADICIONAR').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('NOME').setStyle(TextInputStyle.Short).setRequired(true)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('PRECO').setStyle(TextInputStyle.Short).setRequired(true)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('DESCRICAO').setStyle(TextInputStyle.Paragraph).setRequired(true)));
  await m.delete().catch(()=>{}); await m.showModal(modal).catch(()=>{});
}};