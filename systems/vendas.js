const {EmbedBuilder,PermissionsBitField,ActionRowBuilder,ButtonBuilder,ButtonStyle}=require('discord.js');
const {VENDAS,CORES}=require('../config/config.js');
const qrcode=require('qrcode');
const pixPayload=require('pix-payload');
const moment=require('moment');
module.exports = c => {
  c.on('interactionCreate', async i=>{
    if(!i.isButton()) return;

    if(i.customId==='loja'){
      const ps = c.db.prepare('SELECT * FROM produtos').all();
      if(!ps.length) return i.reply({content:'SEM PRODUTOS',ephemeral:true});
      const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('LOJA');
      const bs=[],l=new ActionRowBuilder();
      ps.forEach((p,x)=>{
        e.addFields({name:'#'+p.id+' '+p.nome,value:'R$'+p.preco.toFixed(2),inline:true});
        l.addComponents(new ButtonBuilder().setCustomId('comprar_'+p.id).setLabel(p.nome).setStyle(ButtonStyle.Success));
        if((x+1)%5===0){bs.push(l);l=new ActionRowBuilder();}
      });
      if(l.components.length) bs.push(l);
      return i.reply({embeds:[e],components:bs,ephemeral:true});
    }

    if(i.customId.startsWith('comprar_')){
      const id=parseInt(i.customId.split('_')[1]);
      const p=c.db.prepare('SELECT * FROM produtos WHERE id=?').get(id);
      if(!p) return i.reply({content:'NAO EXISTE',ephemeral:true});
      const guild=i.guild;
      const canal=await guild.channels.create({
        name:'compra-'+i.user.username,type:0,parent:guild.channels.cache.get(VENDAS.CATEGORIA_COMPRAS),
        permissionOverwrites:[{id:guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:i.user.id,allow:[PermissionsBitField.Flags.ViewChannel]},{id:c.user.id,allow:[PermissionsBitField.Flags.All]}]
      });
      const pc=c.db.prepare('SELECT * FROM config_pix WHERE id=1').get();
      const pix=pixPayload.generate({nome:pc.nome,chave:pc.chave,valor:p.preco.toFixed(2),cidade:pc.cidade,identificador:'PED'+Date.now()});
      const qr=await qrcode.toBuffer(pix.payload,{type:'png',width:280});
      c.db.prepare('INSERT INTO pedidos (user_id,username,itens,total,canal_id,data_pedido) VALUES (?,?,?,?,?,?)').run(i.user.id,i.user.tag,JSON.stringify([p]),p.preco,canal.id,moment().format('DD/MM/YYYY HH:mm'));
      const emb=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('PEDIDO').addFields({name:'ITEM',value:p.nome},{name:'VALOR',value:'R$'+p.preco.toFixed(2)}).setImage('attachment://pix.png');
      const bts=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('pago_'+Date.now()).setLabel('PAGO').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId('cancela').setLabel('CANCELAR').setStyle(ButtonStyle.Danger));
      await canal.send({content:'<@'+i.user.id+'>',embeds:[emb],files:[{attachment:qr,name:'pix.png'}],components:[bts]});
      return i.reply({content:'CANAL: <#'+canal.id+'>',ephemeral:true});
    }
  });
};