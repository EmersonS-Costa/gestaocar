const config = {
  user: 'sa',
  password: 'Rene3527',
  server: 'localhost', // ou 127.0.0.1
  port: 1433,
  database: 'DbGerenciarVeiculos',
  options: {
    encrypt: false,
    enableArithAbort: true
  }
};

//require('dotenv').config();
//const port = process.env.PORT;
//const ConecSt = process.env.CONNECT_STRING;
//const perfil = cpf;
const port = 80;
const sql = require('mssql');
const express = require("express");
const session = require('express-session'); //utilizar os dados recebidos em outras sessões
const app = express();

const path = require('path');
const bodyParser = require("body-parser");
const { Console } = require('console');

app.use(express.json()); // Para processar JSON, se necessário
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true })); // Para processar dados de formulário
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(session({
  secret: 'chave', // Substitua por uma string aleatória e segura
  resave: false,
  saveUninitialized: false
}));

// conectar banco  de dados
async function getConnection() {
  await sql.connect(config);
}
getConnection();

async function execSQLQuery(sqlQry, params = {}) { //Função assíncrona
  const request = new sql.Request(); //Cria um novo objeto de requisição, usado para executar a consulta
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      request.input(key, sql.VarChar, value); //Especifica quando valor é uma string
    } else {
      request.input(key, value); //Para outros tipos de dados, valor padrão
    }
  }
  //Chama o método query() do objeto request, excuta a consulta
  const { recordset } = await request.query(sqlQry);
  return recordset;
}
// Rota 1
app.get("/", (req, res) => {
  res.render('PgLogin')
});
// Rota 2
app.get("/PgHome", (req, res) => {
  res.render('PgHome') // Renderiza a pagina
  //res.json("teste");
});
// Rota 3
app.get("/PgUsuario", async (req, res) => {

  const cpf = req.session.cpfdado
  console.log("CPF :", cpf);
  const resultUsuario = await execSQLQuery("select * from Usuario where CPF = @cpf", { cpf });
  res.render('PgUsuario', { usuario: resultUsuario });

});

// Rota 4
app.get("/PgAutomovel", async (req, res) => {
  const cpf = req.session.cpfdado
  const resultVeiculo = await execSQLQuery("select * from Veiculos where CPF = @cpf", { cpf });
  res.render('PgAutomovel', { veiculo: resultVeiculo });
});

app.post("/PgAutomovel", async (req, res) => {

  const cpf = req.session.cpfdado
  const { Renavam, modelo, Marca, Cor, Placa, Ano, km } = req.body;
  req.session.placadado = Placa;

  console.log("Corpo Veículo:", req.body);
  await execSQLQuery(`INSERT INTO Veiculos(Renavam,	Placa,	Marca,	Modelo,	Ano,	Cor,	Combustivel,	CapacidadeTanque,	Km,	LitrosAtual,	Situacao,	CPF) Values(
    ${Renavam}
    ,'${Placa}'
    ,'${Marca}'
    ,'${modelo}'
    ,${Ano}
    ,'${Cor}'
    ,'Flex'
    ,46
    ,${km}
    ,0
    ,'Normal'
    ,${cpf}
  )`
  );
  res.redirect('/PgAutomovel');
});

// Rota 5
app.get("/PgManutencao", async (req, res) => {
  try {
    const cpf = req.session.cpfdado
    let codigoBarra = parseInt(req.query.CodigoBarra, 10) || 0; // Converte para número
    let placa_enviar = req.query.Placa || '0';
    console.log("Teste Placa 1: ", placa_enviar);
    const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
    const results2 = await execSQLQuery("SELECT * FROM Peca WHERE CodigoBarra = @codigoBarra", { codigoBarra });
    const results3 = await execSQLQuery("SELECT Id, Modelo FROM Veiculos WHERE Placa = @placa_enviar", { placa_enviar });
    const results4 = await execSQLQuery("with CTE as (select MT.DataManutencao,MT.VeiculoId,VC.Placa,MT.Id,MT.PecaId,PC.Item,PC.Descricao,MT.KmAtual,MT.Quilometragem,PC.Duracao_km,ROW_NUMBER() OVER (PARTITION BY MT.PecaId ORDER BY MT.Id DESC)AS RN from Manutencao MT inner join Peca PC on PC.Id = MT.PecaId inner join Veiculos VC on MT.VeiculoId = VC.Id where VC.CPF = @cpf) select DataManutencao ,VeiculoId ,Placa ,Id,PecaId,Item,Descricao,KmAtual,Quilometragem + Duracao_km as KmManutenção,KmAtual-(Quilometragem + Duracao_km) as Km_Restante from CTE  where RN = 1 order By KmManutenção", { cpf });

    res.render('PgManutencao', { oficina: results, peca: results2, modelo: results3, manutencao: results4 });
    console.log("Codigo Barra A: ", codigoBarra);
    console.log("Placa: ", placa_enviar);
    console.log("--------------GET-------------");
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send("Erro ao buscar dados"); // Tratar erro adequadamente
  }
});

// Rota 6
app.post("/PgManutencao", async (req, res) => {
  const cpf = req.session.cpfdado
  const { Data_Manutencao, Placa, Km, Oficina, CodigoBarra, Quantidade } = req.body;

  console.log("REQ BODY: ", req.body);
  const results = await execSQLQuery("SELECT Id, Modelo FROM Veiculos WHERE Placa = @Placa", { Placa });
  const results1 = await execSQLQuery("SELECT Id, Item FROM Peca WHERE CodigoBarra = @CodigoBarra", { CodigoBarra });
  console.log("Veiculo SELCIONADD: ", results);
  console.log("Veiculo ID: ", results[0].Id);
  console.log("PECA SELCIONADD: ", results1);
  console.log("Veiculo ID: ", results1[0].Id);

  await execSQLQuery(`INSERT INTO Manutencao(DataManutencao,Quantidade,Aprovacao,DataAprovacao,CPF,VeiculoId,OficinaId,PecaId,Quilometragem,KmAtual) Values(
${Data_Manutencao}
,${Quantidade}
,'Aprovado'
,${Data_Manutencao}
,${cpf}
,${results[0].Id}
,${Oficina}
,${results1[0].Id}
,${Km}
,${Km})`
  );
  res.redirect('/PgManutencao');
});

// Rota 7
app.get("/PgCombustivel", async (req, res) => {
  const cpf = req.session.cpfdado
  const results = await execSQLQuery("WITH TblConsumo AS (SELECT CB.Id,CB.PostoId,PC.Posto,PC.Endereco,CB.VeiculoId,CB.Completo,LEAD(CB.Completo) OVER (ORDER BY CB.Km, CB.VeiculoId) AS ComDepois,CB.Km,LEAD(CB.Km) OVER (ORDER BY CB.Km, CB.VeiculoId) AS KmPosterior,(LEAD(CB.Km) OVER (ORDER BY CB.Km, CB.VeiculoId))-CB.Km AS KmPercorrido,CB.LitroAbastecido,LEAD(CB.LitroAbastecido) OVER (ORDER BY CB.Km,CB.VeiculoId) AS LitrosUtilizado,VC.CPF,VC.Placa	FROM Combustivel CB	INNER JOIN PostoCombustivel PC ON PC.Id = CB.PostoId inner join Veiculos VC on CB.VeiculoId = VC.Id	WHERE VC.CPF = @cpf)	SELECT TC.Placa,TC.PostoId,TC.Posto,TC.Endereco,TC.VeiculoId,SUM(TC.KmPercorrido) AS KmPercorrido,SUM(TC.LitrosUtilizado) AS LitrosUtilizado,ROUND(SUM(TC.KmPosterior - TC.Km) / NULLIF(SUM(TC.LitrosUtilizado), 0),2) AS Desempenho FROM TblConsumo TC	WHERE	TC.ComDepois = 'Completo'	AND TC.Completo = 'Completo' GROUP BY TC.Placa, TC.PostoId,TC.Posto,TC.Endereco,TC.VeiculoId ORDER BY Desempenho DESC", { cpf });

  const resultPosto = await execSQLQuery("select Id, Posto from PostoCombustivel")

  res.render('PgCombustivel', { abastecido: results, PostoComb: resultPosto });
});
// Rota 8
app.post("/PgCombustivel", async (req, res) => {
  const { Placa, Posto, DataAbastecimento, Km, TipoCombustível, ValorLitro, ValorAbastecido, LitroAbastecido, Completo } = req.body;
  console.log("Cadastro Combustivel: ", req.body);
  const PlacaID = await execSQLQuery("select Id from Veiculos where Placa = @Placa", { Placa });
  console.log("ID DA PLACA ", PlacaID);
  const VeiculoId = PlacaID[0].Id;
  console.log("Veiculo ID: ", VeiculoId);
  console.log("Posto: ", Posto);

  const PostoLocalizacao = await execSQLQuery("select LocalizacaoLat,LocalizacaoLong from PostoCombustivel where Id = @Posto", { Posto });
  console.log("Localização: ", PostoLocalizacao);

  const Latitude = PostoLocalizacao[0].LocalizacaoLat;
  const Longitude = PostoLocalizacao[0].LocalizacaoLong;

  if (Placa) {
    await execSQLQuery(`INSERT INTO Combustivel(LocalizacaoLat,LocalizacaoLong,DataAbastecimento,Km,TipoCombustivel,ValorLitro,ValorAbastecido,LitroAbastecido,VeiculoId,PostoId,Completo) Values(
    ${Latitude}
    ,${Longitude}
    ,${DataAbastecimento}
    ,${Km}
    ,'${TipoCombustível}'
    ,${ValorLitro}
    ,${ValorAbastecido}
    ,${LitroAbastecido}
    ,${PlacaID[0].Id}
    ,${Posto}
    ,'${Completo}')`);
  } else { console.log("Aguardando Valor") };
  const UpdateKM = await execSQLQuery("UPDATE Manutencao SET KmAtual = @Km WHERE VeiculoId = @VeiculoId", { Km, VeiculoId });
  res.redirect('/PgCombustivel');
});

app.get("/PgHistorico", async (req, res) => {

  const cpf = req.session.cpfdado

  const resultCombustivel = await execSQLQuery("select CB.DataAbastecimento,PC.Posto,PC.Endereco,CB.ValorLitro,CB.ValorAbastecido,CB.LitroAbastecido,CB.Completo from Combustivel CB inner join PostoCombustivel PC on PC.Id = CB.PostoId inner join Veiculos VC on VC.Id = CB.VeiculoId where VC.CPF = @cpf", { cpf })

  const results4 = await execSQLQuery("with CTE as (select MT.DataManutencao,MT.VeiculoId,VC.Placa,MT.Id,MT.PecaId,PC.Item,PC.Descricao,MT.KmAtual,MT.Quilometragem,PC.Duracao_km,ROW_NUMBER() OVER (PARTITION BY MT.PecaId ORDER BY MT.Id DESC)AS RN from Manutencao MT inner join Peca PC on PC.Id = MT.PecaId inner join Veiculos VC on MT.VeiculoId = VC.Id where VC.CPF = @cpf) select DataManutencao ,VeiculoId ,Placa ,Id,PecaId,Item,Descricao,KmAtual,Quilometragem + Duracao_km as KmManutenção,KmAtual-(Quilometragem + Duracao_km) as Km_Restante from CTE  where RN = 1 order By KmManutenção", { cpf });

  res.render('PgHistorico', { abastecimento: resultCombustivel, Hmanutencao: results4 });
});
app.get("/PgLogin", async (req, res) => {
  res.render('PgLogin')
});

app.post("/PgLogin", async (req, res) => {
  const { cpf } = req.body
  req.session.cpfdado = cpf;
  console.log("CPF LOGIN:", cpf);
  if (cpf) {
    const resultUsuario = await execSQLQuery("select Nome from Usuario where CPF = @cpf", { cpf });
    console.log("NOME S:", resultUsuario)
    res.render('Index', { nome: resultUsuario });
  } else {
    res.render('PgCadastro');
  }
});

app.get("/logout", async (req, res) => {
  res.render('PgLogin')
});

app.get("/PgCadastro", async (req, res) => {
  res.render('PgCadastro')
});

app.post("/PgCadastro", async (req, res) => {
  const { nome, cpf, telefone } = req.body;
  req.session.cpfdado = cpf;

  const rg = await execSQLQuery("select RG from Usuario where RG = (select max(RG) from Usuario)");

  console.log("RG teste: ", rg);
  console.log("_______ Cadastro");
  const rgad = Number(rg[0].RG) + 1

  console.log("RG  ADD: ", rgad);

  console.log("Corpo Cadastro:", req.body);
  await execSQLQuery(`INSERT INTO Usuario(CPF,RG,Nome,	DataNascimento,	Telefone,	Email,	CEP,	Rua,	Numero,	Bairro,	Cidade,	UF) Values(
    ${cpf} 
    ,'${rgad}'
    ,'${nome}'
    ,'1900-01-01 00:00:00.000'
    ,${telefone}
    ,'@1'
    ,11
    ,'A'
    ,11
    ,'A'
    ,'A'
    ,'AA'
  )`
  );
  res.render('PgLogin');
});

app.get("/PgTransferencia", async (req, res) => {
  const cpf = req.session.cpfdado
  console.log("CPF SESSAO: ", cpf);

  const transferencia = await execSQLQuery("select TF.StatusTransferencia,VC.Placa,VC.Modelo,TF.CPFAnterior,TF.CPFTransferencia, US.Nome from Transferencia TF inner join Veiculos VC on Vc.Id = TF.VeiculoId inner join Usuario US on US.CPF = TF.CPFTransferencia where StatusTransferencia = 'Enviado' and CPFTransferencia = @cpf", { cpf });
  console.log("Transferencia primeiro: ", transferencia);

  if ((Array.isArray(transferencia) && transferencia.length === 0)) {
    const transferencia = await execSQLQuery("select TF.StatusTransferencia,VC.Placa,VC.Modelo,TF.CPFAnterior,TF.CPFTransferencia, US.Nome from Transferencia TF inner join Veiculos VC on Vc.Id = TF.VeiculoId inner join Usuario US on US.CPF = TF.CPFTransferencia where StatusTransferencia = 'Enviado' and TF.CPFAnterior = @cpf", { cpf });
    console.log("Trasnferencia CPF ANTES", transferencia);
    res.render('PgTransferencia', { transfer: transferencia, cpf });
  }
  else {
    res.render('PgTransferencia', { transfer: transferencia, cpf });
  }
  console.log(" -----------");
});

app.post("/PgTransferencia", async (req, res) => {
  const cpf = req.session.cpfdado
  const { Placa, CPFTransf, aprovar } = req.body;
  console.log("Req Body Transferencia: ", req.body);

  if(aprovar === "aprovar"){
        //Bloco do CPF que esta recebendo a transferência

        const VclId = await execSQLQuery("select TF.VeiculoId from Transferencia TF where TF.CPFTransferencia = @cpf and TF.StatusTransferencia = 'Enviado'", { cpf});      
        console.log("IDVeiculo: ", VclId);
        const VeiculoID = VclId[0].VeiculoId;
        console.log("IDVeiculo: ", VeiculoID);

        const UpdadteVeiculo = await execSQLQuery("update Veiculos set CPF = @cpf where Id = @VeiculoID ", { cpf, VeiculoID });
        const UpdadteManutencao = await execSQLQuery("update Manutencao set CPF = @cpf where Id = @VeiculoID ", { cpf, VeiculoID });
        const UpdateStatusTransferencia = await execSQLQuery("UPDATE Transferencia SET StatusTransferencia = 'Transferido' WHERE StatusTransferencia = 'Enviado' and CPFTransferencia = @cpf ", { cpf });

        res.redirect('PgTransferencia');

  }else if (cpf !== CPFTransf) {
    //Bloco que recebe informação do CPF que esta enviando a transferência
    const PlacaID = await execSQLQuery("select Id from Veiculos where Placa = @Placa", { Placa });
    console.log("ID DA PLACA ", PlacaID);
    const cpfId = await execSQLQuery("select * from Usuario where CPF = @cpf", { cpf });
    await execSQLQuery(`INSERT INTO Transferencia(DataEnvio,CPFAnterior,CPFTransferencia,DataTransferencia,	StatusTransferencia,UsuarioId,VeiculoId) Values(
  '1900-01-01 00:00:00.000'
  ,${cpf}
  ,${CPFTransf}
  ,'1900-01-01 00:00:00.000'
  ,'Enviado'
  ,${cpfId[0].Id}
  ,${PlacaID[0].Id}
)`
    );
    res.redirect('PgTransferencia');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});