require('dotenv').config();
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
