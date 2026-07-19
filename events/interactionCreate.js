module.exports = async (c,i) => {
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
};