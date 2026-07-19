const {ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder}=require('discord.js');
const {VERIFICACAO,CORES}=require('../../config/config.js');
module.exports={name:'veri',adminOnly:true,async execute(c,m){
  const url=process.env.REDIRECT_URL.split('/callback')[0]+'/login';
  const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('VERIFICACAO').setDescription(VERIFICACAO.MENSAGEM);
  const b=new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(VERIFICACAO.BOTAO_TEXTO).setStyle(ButtonStyle.Link).setURL(url));
  await m.delete().catch(()=>{}); m.channel.send({embeds:[e],components:[b]});
}};