const {ModalBuilder,ActionRowBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
module.exports={name:'removeitem',adminOnly:true,async execute(c,m){
  const modal=new ModalBuilder().setCustomId('modal_removeitem').setTitle('REMOVER').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID ITEM').setStyle(TextInputStyle.Short).setRequired(true)));
  await m.delete().catch(()=>{}); await m.showModal(modal).catch(()=>{});
}};