const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname,'alencararts.db'));

db.exec(`
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
`);

db.prepare = function(sql){
  const stmt = db.prepare(sql);
  return {
    get(...p){ try{ return stmt.get(...p); }catch(e){ return null; } },
    all(...p){ try{ return stmt.all(...p); }catch(e){ return []; } },
    run(...p){ try{ const r=stmt.run(...p); return {changes:r.changes,lastID:r.lastInsertRowid}; }catch(e){ return {changes:0}; } }
  };
};

module.exports = db;
