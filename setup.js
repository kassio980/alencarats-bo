const fs = require('fs-extra');
console.log('CRIANDO BOT ALENCARARTS...');

['./commands','./commands/verificacao','./commands/vendas','./commands/vendas/sub',
 './commands/tickets','./events','./systems','./database','./utils','./config','./temp','./transcripts'
].forEach(p => { fs.ensureDirSync(p); console.log('PASTA: '+p); });

// .ENV
fs.writeFileSync('./.env.example', `BOT_TOKEN=SEU_TOKEN
GUILD_ID=ID_SERVIDOR
CLIENT_ID=SEU_CLIENT_ID
CLIENT_SECRET=SEU_CLIENT_SECRET
REDIRECT_URL=http://localhost:3000/callback
PIX_NOME=ALENCAR ARTS
PIX_CHAVE=SUA_CHAVE_PIX
PIX_CIDADE=SALVADOR
PIX_EXPIRACAO_MINUTOS=15
PORT=3000
`);

// .GITIGNORE
fs.writeFileSync('./.gitignore', `node_modules
.env
database/*.db
*.log
.DS_Store
`);

// PACKAGE.JSON
fs.writeFileSync('./package.json', `{
  "name":"alencararts-bot","version":"3.1.0","main":"index.js",
  "scripts":{"start":"node index.js","setup":"node setup.js"},
  "dependencies":{
    "discord.js":"^14.16.3","express":"^4.21.1","axios":"^1.7.7",
    "qrcode":"^1.5.4","pix-payload":"^1.1.0","moment":"^2.30.1",
    "fs-extra":"^11.2.0","chalk":"^4.1.2","dotenv":"^16.4.5"
  }
}`);

// CONFIG
fs.writeFileSync('./config/config.js', `module.exports = {
  PREFIX:"+",
  ADMIN_ROLES:["ID_ADMIN_1","ID_ADMIN_2"],
  VERIFICACAO:{
    CARGO_VERIFICADO:"ID_CARGO_VERIFICADO",
    MENSAGEM:"A Alencararts pede que voce se verifique para ter acesso a todos os canais",
    BOTAO_TEXTO:"VERIFICAR-SE"
  },
  VENDAS:{CATEGORIA_COMPRAS:"ID_CATEGORIA_COMPRAS",CANAL_LOGS:"ID_LOGS"},
  TICKETS:{
    CATEGORIA_TICKETS:"ID_CATEGORIA_TICKETS",CANAL_LOGS:"ID_LOGS_TICKETS",
    CATEGORIAS:[
      {nome:"Comprar Produto",emoji:"🛒"},{nome:"Pagamento",emoji:"💰"},
      {nome:"Entrega",emoji:"📦"},{nome:"Duvidas",emoji:"❓"},
      {nome:"Suporte",emoji:"⚙️"},{nome:"Parcerias",emoji:"🤝"},
      {nome:"Sugestoes",emoji:"💡"},{nome:"Bug",emoji:"🐛"},
      {nome:"Denuncias",emoji:"🚨"},{nome:"Reembolso",emoji:"🔄"}
    ]
  },
  CORES:{SUCESSO:"#00FF88",ERRO:"#FF3333",AVISO:"#FFCC00",INFO:"#3399FF",ALENCAR:"#FF0080"}
}`);

// DATABASE
fs.writeFileSync('./database/db.js', `const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname,'alencararts.db'));

db.exec(\`
  CREATE TABLE IF NOT EXISTS verificados (
    user_id TEXT PRIMARY KEY, username TEXT, discriminador TEXT,
    avatar TEXT, email TEXT, data_verificacao TEXT, servidores TEXT);
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT UNIQUE, preco REAL,
    descricao TEXT, arquivo TEXT, licenca TEXT, link TEXT,
    cargo_id TEXT, estoque INTEGER DEFAULT 999);
  CREATE TABLE IF NOT EXISTS carrinhos (
    user_id TEXT, item_id INTEGER, quantidade INTEGER DEFAULT 1,
    PRIMARY KEY (user_id,item_id));
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, username TEXT,
    itens TEXT, total REAL, status TEXT DEFAULT 'pendente',
    pix_codigo TEXT, canal_id TEXT, data_pedido TEXT, data_pagamento TEXT);
  CREATE TABLE IF NOT EXISTS tickets (
    canal_id TEXT PRIMARY KEY, user_id TEXT, username TEXT,
    categoria TEXT, status TEXT DEFAULT 'aberto', data_abertura TEXT);
  CREATE TABLE IF NOT EXISTS config_pix (
    id INTEGER PRIMARY KEY, nome TEXT, chave TEXT, cidade TEXT,
    expiracao INTEGER DEFAULT 15);
  INSERT OR IGNORE INTO config_pix VALUES (1,'ALENCAR ARTS','CHAVE_PADRAO','SALVADOR',15);
\`);

db.prepare = function(sql){
  const stmt = db.prepare(sql);
  return {
    get(...p){ try{ return stmt.get(...p); }catch(e){ return null; } },
    all(...p){ try{ return stmt.all(...p); }catch(e){ return []; } },
    run(...p){ try{ const r=stmt.run(...p); return {changes:r.changes,lastID:r.lastInsertRowid}; }catch(e){ return {changes:0}; } }
  };
};

module.exports = db;
`);

// INDEX
fs.writeFileSync('./index.js', `require('dotenv').config();
const {Client,GatewayIntentBits,Partials,Collection} = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,GatewayIntentBits.MessageContent
  ],
  partials:[Partials.Channel,Partials.Message,Partials.Reaction,Partials.User],
  allowedMentions:{parse:['users','roles'],repliedUser:true}
});

client.commands = new Collection();
client.config = require('./config/config.js');
client.db = require('./database/db.js');

function loadCmds(d='./commands'){
  fs.readdirSync(d).forEach(f=>{
    const c = path.join(d,f);
    if(fs.statSync(c).isDirectory()) loadCmds(c);
    else if(f.endsWith('.js')){
      try{
        const m = require('./'+c);
        if(m.name){ client.commands.set(m.name.toLowerCase(),m); console.log('COMANDO: '+m.name); }
      }catch(e){console.log('ERRO EM: '+f+' -> '+e.message);}
    }
  });
}
loadCmds();

fs.readdirSync('./events').filter(f=>f.endsWith('.js')).forEach(f=>{
  try{
    const e = require('./events/'+f);
    client.on(f.split('.')[0], e.bind(null,client));
    console.log('EVENTO: '+f.split('.')[0]);
  }catch(e){console.log('ERRO EVENTO: '+f);}
});

require('./systems/verificacao.js')(client);
require('./systems/vendas.js')(client);
require('./systems/tickets.js')(client);

client.login(process.env.BOT_TOKEN)
  .then(()=>console.log('BOT ONLINE COM SUCESSO!'))
  .catch(e=>console.log('ERRO NO LOGIN: '+e.message));
`);

// EVENTS
fs.writeFileSync('./events/messageCreate.js', `const {PREFIX,ADMIN_ROLES} = require('../config/config.js');
module.exports = async (c,m) => {
  if(m.author.bot||!m.guild||!m.content.startsWith(PREFIX)) return;
  const a = m.content.slice(PREFIX.length).trim().split(/ +/);
  const n = a.shift().toLowerCase();
  const cmd = c.commands.get(n); if(!cmd) return;
  const ad = m.member.roles.cache.some(r=>ADMIN_ROLES.includes(r.id));
  if(!ad && cmd.adminOnly) return m.reply('SEM PERMISSAO!').then(x=>setTimeout(()=>x.delete(),5000));
  try{ await cmd.execute(c,m,a); }catch(e){console.log(e); m.reply('ERRO NO COMANDO!');}
};`);

fs.writeFileSync('./events/ready.js', `const chalk = require('chalk');
const {ActivityType} = require('discord.js');
module.exports = async c => {
  console.log('CONECTADO COMO: '+c.user.tag);
  c.user.setActivity({name:'Alencararts | +help',type:ActivityType.Streaming,url:'https://twitch.tv/alencararts'});
};`);

fs.writeFileSync('./events/interactionCreate.js', `module.exports = async (c,i) => {
  if(!i.isModalSubmit()) return;
  const reply = (t)=>i.reply({content:t,ephemeral:true}).catch(()=>{});
  
  if(i.customId==='modal_additem'){
    const nome=i.fields.getTextInputValue('nome');
    const preco=parseFloat(i.fields.getTextInputValue('preco'));
    const desc=i.fields.getTextInputValue('desc');
    const arq=i.fields.getTextInputValue('arquivo')||'';
    const lk=i.fields.getTextInputValue('link')||'';
    if(isNaN(preco)) return reply('PRECO INVALIDO!');
    c.db.prepare('INSERT INTO produtos (nome,preco,descricao,arquivo,link) VALUES (?,?,?,?,?)').run(nome,preco,desc,arq,lk);
    return i.reply('PRODUTO CADASTRADO: '+nome+' R$'+preco.toFixed(2));
  }

  if(i.customId==='modal_removeitem'){
    const id=parseInt(i.fields.getTextInputValue('id'));
    const ex = c.db.prepare('SELECT * FROM produtos WHERE id=?').get(id);
    if(!ex) return reply('PRODUTO NAO EXISTE!');
    c.db.prepare('DELETE FROM produtos WHERE id=?').run(id);
    return i.reply('PRODUTO REMOVIDO ID: '+id);
  }

  if(i.customId==='modal_configpix'){
    const n=i.fields.getTextInputValue('nome');
    const ch=i.fields.getTextInputValue('chave');
    const ci=i.fields.getTextInputValue('cidade');
    const ex=parseInt(i.fields.getTextInputValue('exp'));
    c.db.prepare('UPDATE config_pix SET nome=?,chave=?,cidade=?,expiracao=? WHERE id=1').run(n,ch,ci,isNaN(ex)?15:ex);
    return i.reply('PIX ATUALIZADO!');
  }

  if(i.customId==='modal_puxa'){
    const qtd=parseInt(i.fields.getTextInputValue('qtd'));
    const conv=i.fields.getTextInputValue('convite');
    if(isNaN(qtd)) return reply('QUANTIDADE INVALIDA!');
    await reply('ENVIANDO... AGUARDE');
    const lista = c.db.prepare('SELECT * FROM verificados LIMIT ?').all(qtd);
    let ok=0,fl=0;
    for(const m of lista){
      try{ const u=await c.users.fetch(m.user_id); await u.send('CONVITE ALENCARARTS: '+conv); ok++; await new Promise(r=>setTimeout(r,1200)); }
      catch{fl++;}
    }
    return i.channel.send('CONCLUIDO: SUCESSO '+ok+' | FALHAS '+fl);
  }
};`);

// SYSTEMS
fs.writeFileSync('./systems/verificacao.js', `const express=require('express');
const axios=require('axios');
const moment=require('moment');
module.exports = c => {
  const app = express();
  app.get('/login',(req,res)=>{
    res.redirect(\`https://discord.com/api/oauth2/authorize?client_id=\${process.env.CLIENT_ID}&redirect_uri=\${encodeURIComponent(process.env.REDIRECT_URL)}&response_type=code&scope=identify%20email%20guilds\`);
  });
  app.get('/callback', async (req,res)=>{
    try{
      const code=req.query.code; if(!code) return res.send('CODIGO INVALIDO');
      const tok=await axios.post('https://discord.com/api/oauth2/token',
        new URLSearchParams({client_id:process.env.CLIENT_ID,client_secret:process.env.CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:process.env.REDIRECT_URL,scope:'identify email guilds'}),
        {headers:{'Content-Type':'application/x-www-form-urlencoded'}});
      const usr=await axios.get('https://discord.com/api/users/@me',{headers:{Authorization:'Bearer '+tok.data.access_token}});
      const uid=usr.data.id,un=usr.data.username,disc=usr.data.discriminator||'0';
      const av=usr.data.avatar?\`https://cdn.discordapp.com/avatars/\${uid}/\${usr.data.avatar}.png\`:'https://cdn.discordapp.com/embed/avatars/0.png';
      const em=usr.data.email||'SEM EMAIL';
      const guild=c.guilds.cache.get(process.env.GUILD_ID);
      if(guild){
        const mb=await guild.members.fetch(uid).catch(()=>{});
        if(mb) await mb.roles.add(c.config.VERIFICACAO.CARGO_VERIFICADO).catch(()=>{});
      }
      c.db.prepare('INSERT OR REPLACE INTO verificados VALUES (?,?,?,?,?,?,?)').run(uid,un,disc,av,em,moment().format('DD/MM/YYYY HH:mm:ss'),'');
      res.send('<h1 style=color:green>VERIFICADO COM SUCESSO! VOLTE AO DISCORD</h1>');
    }catch(e){console.log(e); res.send('ERRO NA VERIFICACAO');}
  });
  app.listen(process.env.PORT||3000,()=>console.log('WEB VERIFICACAO EM: '+process.env.REDIRECT_URL));
};`);

fs.writeFileSync('./systems/vendas.js', `const {EmbedBuilder,PermissionsBitField,ActionRowBuilder,ButtonBuilder,ButtonStyle}=require('discord.js');
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
};`);

fs.writeFileSync('./systems/tickets.js', `const {EmbedBuilder,PermissionsBitField}=require('discord.js');
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
};`);

// COMANDOS
fs.writeFileSync('./commands/verificacao/veri.js', `const {ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder}=require('discord.js');
const {VERIFICACAO,CORES}=require('../../config/config.js');
module.exports={name:'veri',adminOnly:true,async execute(c,m){
  const url=process.env.REDIRECT_URL.split('/callback')[0]+'/login';
  const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('VERIFICACAO').setDescription(VERIFICACAO.MENSAGEM);
  const b=new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(VERIFICACAO.BOTAO_TEXTO).setStyle(ButtonStyle.Link).setURL(url));
  await m.delete().catch(()=>{}); m.channel.send({embeds:[e],components:[b]});
}};`);

fs.writeFileSync('./commands/verificacao/puxa.js', `const {ActionRowBuilder,ButtonBuilder,EmbedBuilder,ModalBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
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
}};`);

fs.writeFileSync('./commands/vendas/venda.js', `const {ActionRowBuilder,ButtonBuilder,EmbedBuilder}=require('discord.js');
const {CORES}=require('../../config/config.js');
module.exports={name:'venda',adminOnly:true,async execute(c,m){
  const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('LOJA');
  const l=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('loja').setLabel('VER ITENS').setStyle('Primary'));
  await m.delete().catch(()=>{}); m.channel.send({embeds:[e],components:[l]});
}};`);

fs.writeFileSync('./commands/vendas/sub/additem.js', `const {ModalBuilder,ActionRowBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
module.exports={name:'additem',adminOnly:true,async execute(c,m){
  const modal=new ModalBuilder().setCustomId('modal_additem').setTitle('ADICIONAR').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('NOME').setStyle(TextInputStyle.Short).setRequired(true)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('PRECO').setStyle(TextInputStyle.Short).setRequired(true)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('DESCRICAO').setStyle(TextInputStyle.Paragraph).setRequired(true)));
  await m.delete().catch(()=>{}); await m.showModal(modal).catch(()=>{});
}};`);

fs.writeFileSync('./commands/vendas/sub/removeitem.js', `const {ModalBuilder,ActionRowBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
module.exports={name:'removeitem',adminOnly:true,async execute(c,m){
  const modal=new ModalBuilder().setCustomId('modal_removeitem').setTitle('REMOVER').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID ITEM').setStyle(TextInputStyle.Short).setRequired(true)));
  await m.delete().catch(()=>{}); await m.showModal(modal).catch(()=>{});
}};`);

fs.writeFileSync('./commands/vendas/sub/configpix.js', `const {ModalBuilder,ActionRowBuilder,TextInputBuilder,TextInputStyle}=require('discord.js');
module.exports={name:'configpix',adminOnly:true,async execute(c,m){
  const a=c.db.prepare('SELECT * FROM config_pix WHERE id=1').get();
  const modal=new ModalBuilder().setCustomId('modal_configpix').setTitle('PIX').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('NOME').setStyle(TextInputStyle.Short).setValue(a.nome)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('chave').setLabel('CHAVE').setStyle(TextInputStyle.Short).setValue(a.chave)));
  await m.delete().catch(()=>{}); await m.showModal(modal).catch(()=>{});
}};`);

fs.writeFileSync('./commands/tickets/painel.js', `const {ActionRowBuilder,ButtonBuilder,EmbedBuilder}=require('discord.js');
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
}};`);

fs.writeFileSync('./commands/help.js', `const {EmbedBuilder}=require('discord.js');
const {CORES,PREFIX}=require('../config/config.js');
module.exports={name:'help',adminOnly:true,async execute(c,m){
  const e=new EmbedBuilder().setColor(CORES.ALENCAR).setTitle('COMANDOS').addFields({name:'GERAIS',value:'+veri, +puxa, +venda, +painel, +additem, +removeitem, +configpix'});
  m.reply({embeds:[e]});
}};`);

console.log('====================================');
console.log('TUDO CRIADO COM SUCESSO!');
console.log('PARA CONTINUAR:');
console.log('1. cp .env.example .env');
console.log('2. nano .env -> COLOQUE SEUS DADOS');
console.log('3. node index.js');
console.log('====================================');
