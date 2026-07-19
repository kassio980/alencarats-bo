const {EmbedBuilder,PermissionsBitField}=require('discord.js');
const {TICKETS,CORES}=require('../config/config.js');
const moment=require('moment');
module.exports = c => {
  c.on('interactionCreate', async i=>{
    if(!i.isButton()||!i.customId.startsWith('ticket_')) return;
    const cat=i.customId.replace('ticket_','');
    const jatem=c.db.prepare('SELECT * FROM tickets WHERE user_id=? AND status=?').get(i.user.id,'aberto');
    if(jatem) return i.reply({content:'JA TEM ABERTO: <#'+jatem.canal_id+'>',ephemeral:true});
    await i.deferReply({ephemeral:true});
    const g=i.guild;
    const ch=await g.channels.create({name:'ticket-'+i.user.username,type:0,parent:g.channels.cache.get(TICKETS.CATEGORIA_TICKETS),permissionOverwrites:[{id:g.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:i.user.id,allow:[PermissionsBitField.Flags.ViewChannel]},{id:c.user.id,allow:[PermissionsBitField.Flags.All]}]});
    c.db.prepare('INSERT INTO tickets VALUES (?,?,?,?,?)').run(ch.id,i.user.id,i.user.tag,cat,moment().format('DD/MM/YYYY HH:mm'));
    await ch.send({embeds:[new EmbedBuilder().setColor(CORES.INFO).setTitle('TICKET: '+cat).addFields({name:'USUARIO',value:'<@'+i.user.id+'>'})]});
    await i.editReply({content:'CRIADO: <#'+ch.id+'>'});
  });
};