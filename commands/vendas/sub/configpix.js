const {ModalBuilder,ActionRowBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
module.exports={name:'configpix',adminOnly:true,async execute(c,m){
  const a=c.db.prepare('SELECT * FROM config_pix WHERE id=1').get();
  const modal=new ModalBuilder().setCustomId('modal_configpix').setTitle('PIX').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('NOME').setStyle(TextInputStyle.Short).setValue(a.nome)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('chave').setLabel('CHAVE').setStyle(TextInputStyle.Short).setValue(a.chave)));
  await m.delete().catch(()=>{}); await m.showModal(modal).catch(()=>{});
}};