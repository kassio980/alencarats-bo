module.exports = {
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
}