const express=require('express');
const axios=require('axios');
const moment=require('moment');
module.exports = c => {
  const app = express();
  app.get('/login',(req,res)=>{
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URL)}&response_type=code&scope=identify%20email%20guilds`);
  });
  app.get('/callback', async (req,res)=>{
    try{
      const code=req.query.code; if(!code) return res.send('CODIGO INVALIDO');
      const tok=await axios.post('https://discord.com/api/oauth2/token',
        new URLSearchParams({client_id:process.env.CLIENT_ID,client_secret:process.env.CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:process.env.REDIRECT_URL,scope:'identify email guilds'}),
        {headers:{'Content-Type':'application/x-www-form-urlencoded'}});
      const usr=await axios.get('https://discord.com/api/users/@me',{headers:{Authorization:'Bearer '+tok.data.access_token}});
      const uid=usr.data.id,un=usr.data.username,disc=usr.data.discriminator||'0';
      const av=usr.data.avatar?`https://cdn.discordapp.com/avatars/${uid}/${usr.data.avatar}.png`:'https://cdn.discordapp.com/embed/avatars/0.png';
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
};