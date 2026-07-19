const {PREFIX,ADMIN_ROLES} = require('../config/config.js');
module.exports = async (c,m) => {
  if(m.author.bot||!m.guild||!m.content.startsWith(PREFIX)) return;
  const a = m.content.slice(PREFIX.length).trim().split(/ +/);
  const n = a.shift().toLowerCase();
  const cmd = c.commands.get(n); if(!cmd) return;
  const ad = m.member.roles.cache.some(r=>ADMIN_ROLES.includes(r.id));
  if(!ad && cmd.adminOnly) return m.reply('SEM PERMISSAO!').then(x=>setTimeout(()=>x.delete(),5000));
  try{ await cmd.execute(c,m,a); }catch(e){console.log(e); m.reply('ERRO NO COMANDO!');}
};