
4047024736924
const perfil = '31575414805';
const port = 3000;
const config = {
  user: 'sa',
  password: 'Rene3527',
  server: 'localhost',
  port: 1433, 
  database: 'DbGerenciarVeiculos',
  options: {
    encrypt: false,
    enableArithAbort: true
  }
};
const sql = require('mssql');
const express = require("express");
const path = require('path');
const app = express();
const bodyParser = require("body-parser");

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');

async function getConnection() {
  await sql.connect(config);
}
getConnection();

async function execSQLQuery(sqlQry, params = []) {
  const request = new sql.Request();
  
  // Adiciona parâmetros ao request se existirem
  params.forEach((param, index) => {
    request.input(`param${index}`, param);
  });
  
  const { recordset } = await request.query(sqlQry);
  return recordset;
};

app.get("/PgManutencao", async (req, res) => {
  try {
      const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
      
      // Use o nome do parâmetro na consulta SQL e passe-o na função execSQLQuery
      const results2 = await execSQLQuery(
        'SELECT Id, CPF, Placa FROM Veiculos WHERE CPF = @param0', 
        [perfil]
      );
      
      res.render('PgManutencao', { oficina: results, veiculo: results2 });
  } catch (error) {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send("Erro ao buscar dados");
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});



app.get("/PgManutencao", async (req, res) => {
    try {
        const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
        // Usando uma variável nomeada em vez de "?"
        const request = new sql.Request();
        request.input('cpf', sql.VarChar, perfil); // Define a variável @cpf
        const results2 = await request.query('SELECT Id, CPF, Placa FROM Veiculos WHERE CPF = @cpf'); // Usando @cpf no SQL  
        res.render('PgManutencao', { oficina: results, veiculo: results2 });
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).send("Erro ao buscar dados"); // Tratar erro adequadamente
    }
  });
  

  //Select no banco com condição váriavel
  app.get("/PgManutencao", async (req, res) => {
    try {
        const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
        
        const request = new sql.Request();
        request.input('cpf', sql.VarChar, perfil); // Define a variável @cpf
        const results2 = await request.query('SELECT Id, CPF, Placa FROM Veiculos WHERE CPF = @cpf'); // Usando @cpf no SQL  
        res.render('PgManutencao', { oficina: results, veiculo: results2 });
  
        console.log(results2);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).send("Erro ao buscar dados"); // Tratar erro adequadamente
    }
  });

  app.get("/PgManutencao", async (req, res) => {
    try {
        const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
        const results2 = await execSQLQuery("Select Id, CPF, Placa, Marca, Modelo  from Veiculos where CPF = 31575414805");
        const results3 = await execSQLQuery("select * from Peca");
        res.render('PgManutencao', { oficina: results, veiculo: results2, peca: results3});
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).send("Erro ao buscar dados"); // Tratar erro adequadamente
    }
  });




  app.post("/PgCombustivel", async (req, res) => {
    //Cadastrar combustiveis 
    const { Latitude, Longitude ,DataAbastecimento, Km, TipoCombustível, ValorLitro, ValorAbastecido, LitroAbastecido,VeiculoId,PostoId }= req.body;
  
    await execSQLQuery(`INSERT INTO Combustivel(LocalizacaoLat ,LocalizacaoLong,DataAbastecimento,Km,TipoCombustivel,ValorLitro,ValorAbastecido,LitroAbastecido,VeiculoId,PostoId) Values(
                                    ${Latitude}
                                    ,${Longitude}
                                    ,${DataAbastecimento}
                                    ,${Km}
                                    ,'${TipoCombustível}'
                                    ,${ValorLitro}
                                    ,${ValorAbastecido}
                                    ,${LitroAbastecido}
                                    ,${VeiculoId}
                                    ,${PostoId})`
    );
    res.sendStatus(201);
  })


  <div class="form-group col-sm-2 mb-3">
  <label for="nome">Modelo</label>
  <select name="KM" id="KM" class="form-control">
    <option value="">Modelo</option>
    <div>
        <% veiculo.forEach(function(item) { %>
        <option value="<%= item.id %>"> <%= item.Modelo %> </option>
        <% }); %>
    </div>
  </select>
</div>




// Função que é chamada sempre que o usuário digita algo no campo "Codigo de Barra"
<script>
function enviarCodigoBarraAutomaticamente() {
  var CodigoBarra = document.getElementById("CodigoBarra").value;
  if (CodigoBarra) {
    window.location.href = `/PgManutencao?CodigoBarra=${encodeURIComponent(CodigoBarra)}`;
  }
}
function verificarEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita o comportamento padrão de submit
    enviarCodigoBarraAutomaticamente(); // Chama a função de envio
  }
}
</script>



function enviarPlacaAutomaticamente() {
  // Obtém o valor selecionado no <select>
  var selectElement = document.getElementById("placa");
  var Placa = selectElement.value;

  console.log("Teste Placa:", Placa)

  // Verifica se há um valor selecionado
  if (Placa) {
      // Redireciona para a página com o valor na query string
      window.location.href = `/PgManutencao?Placa=${encodeURIComponent(Placa)}`;
  }
}


// Comando Server com SQL sem er parametrizada 30_Outubro
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
const perfil = '31575414805';
const port = 3000;
const sql = require('mssql');
const express = require("express");
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');

async function getConnection() {
  await sql.connect(config);
}
getConnection();

async function execSQLQuery(sqlQry) {
  const request = new sql.Request();
  const { recordset } = await request.query(sqlQry);
  return recordset;
};

app.get("/PgManutencao", async (req, res) => {
  try {
    let codigoBarra = req.query.CodigoBarra;
    let placa_enviar = req.query.Placa;

    console.log("Teste Placa 1: ", placa_enviar);

    if(codigoBarra === undefined){  
      codigoBarra = 0; 
    }

    if(!placa_enviar){  
      placa_enviar = 0; 
    }
      const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
      const results2 = await execSQLQuery(`Select Id, Placa from Veiculos where CPF = ${perfil}`);
      const results3 = await execSQLQuery(`select * from Peca where CodigoBarra = ${codigoBarra}`);

      const results4 = await execSQLQuery(`Select Id, Modelo from Veiculos where Placa = '${placa_enviar}'`);

    res.render('PgManutencao', { oficina: results, veiculo_placa: results2, peca: results3, modelo: results4 });

      console.log(codigoBarra);
      console.log(placa_enviar);
      codigoBarra = 0;
      placa = 0;
   } catch (error) {
      console.error('Erro ao buscar dados:', error);
      res.status(500).send("Erro ao buscar dados"); // Tratar erro adequadamente
  }
});

app.post("/PgManutencao", async (req, res) => {
  const { Data_Manutencao, Quantidade, placa, Km} = req.body;
  const results2 = await execSQLQuery(`Select Id from Veiculos where CPF = ${perfil}`);

  await execSQLQuery(`INSERT INTO Manutencao(DataManutencao,Quantidade,Aprovacao,DataAprovacao,CPF,VeiculoId,OficinaId,PecaId,Quilometragem) Values(
    ${Data_Manutencao}
    ,${Quantidade}
    ,'Aprovado'
    ,${Data_Manutencao}
    ,${perfil}
    ,${ results2.id }
    ,0
    ,0
    ,0 )` )
});

app.use("/PgUsuarios", (req, res) => {
  //Mostra a pagina Usuarios
  res.render('PgUsuarios')
});

app.use("/PgHome", (req, res) => {
  //Mostra a pagina principal Index
  res.render('PgHome')
  //res.json("teste");
});

app.use("/", (req, res) => {
  //Mostra a pagina principal Index
  res.render('Index')
  //res.json("teste");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


<% abastecido.forEach(function(item) { %>
  <option value="<%= item.Id %>"> <%= item.Posto %></option>
<% }); %>
</select>


// Função chamada para adicionar geolocalização
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
      (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          // Exibe as coordenadas na página
          document.getElementById("Lt").textContent = latitude;
          document.getElementById("Lg").textContent = longitude;
          // Envia as coordenadas automaticamente para o servidor, se desejado
          fetch("/PgCombustivel", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ latitude, longitude })
          })
          .then(response => response.json())
          .then(data => console.log("Coordenadas enviadas com sucesso:", data))
          .catch(error => console.error("Erro ao enviar coordenadas:", error));
      },
      (error) => {
          console.error("Erro ao obter geolocalização:", error.message);
          document.getElementById("Lt").textContent = "Não disponível";
          document.getElementById("Lg").textContent = "Não disponível";
      }
  );
} else {
  console.log("Geolocalização não é suportada neste navegador.");
  document.getElementById("Lt").textContent = "Não suportada";
  document.getElementById("Lg").textContent = "Não suportada";
}




---

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
const perfil = '31575414805';
const port = 3000;
const sql = require('mssql');
const express = require("express");
//const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");

app.use(express.json()); // Para processar JSON, se necessário
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({ extended: true })); // Para processar dados de formulário
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views');
async function getConnection() {
  await sql.connect(config);
}
getConnection();

async function execSQLQuery(sqlQry, params = {}) {
  const request = new sql.Request();  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      request.input(key, sql.VarChar, value);
    } else {
      request.input(key, value);
    }
  }  
  const { recordset } = await request.query(sqlQry);
  return recordset;
}

app.get("/PgManutencao", async (req, res) => {
  try {
    let codigoBarra = parseInt(req.query.CodigoBarra, 10) || 0; // Converte para número
    let placa_enviar = req.query.Placa || '0';
    console.log("Teste Placa 1: ", placa_enviar);
    const results = await execSQLQuery("SELECT Id, Nome FROM Oficina");
    const results2 = await execSQLQuery("Select Id, Placa from Veiculos where CPF = @perfil", { perfil });
    const results3 = await execSQLQuery("SELECT * FROM Peca WHERE CodigoBarra = @codigoBarra", { codigoBarra });
    const results4 = await execSQLQuery("SELECT Id, Modelo FROM Veiculos WHERE Placa = @placa_enviar", { placa_enviar });
    
    //const results5 = await execSQLQuery("select	MT.DataManutencao,MT.VeiculoId,MT.Id,MT.PecaId,PC.Item,PC.Descricao,MT.Quilometragem + PC.Duracao_km as KmManutenção,MT.KmAtual,MT.KmAtual-(MT.Quilometragem + PC.Duracao_km) as Km_Restante from Manutencao MT inner join Peca PC on PC.Id = MT.PecaId where VeiculoId = 14 order By KmManutenção");
    const results5 = await execSQLQuery("with CTE as (select	MT.DataManutencao,MT.VeiculoId,MT.Id,MT.PecaId,PC.Item, PC.Descricao,MT.KmAtual, MT.Quilometragem, PC.Duracao_km,ROW_NUMBER() OVER (PARTITION BY MT.PecaId ORDER BY MT.Id DESC)AS RN from Manutencao MT inner join Peca PC on PC.Id = MT.PecaId where VeiculoId = 14) select	DataManutencao,VeiculoId,Id,PecaId,Item, Descricao,KmAtual,Quilometragem + Duracao_km as KmManutenção,KmAtual-(Quilometragem + Duracao_km) as Km_Restante from CTE where RN = 1 order By KmManutenção");

    res.render('PgManutencao', { oficina: results, veiculo_placa: results2, peca: results3, modelo: results4, manutencao: results5 });
    //console.log("Dados da results5 Mt: ", results5);

    console.log("Codigo Barra A: ",codigoBarra);
    console.log("Placa: ",placa_enviar);
    console.log("--------------GET-------------");


  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send("Erro ao buscar dados"); // Tratar erro adequadamente
  }
});


app.post("/PgManutencao", async (req, res) => {

  const { Data_Manutencao, Placa, Km, Oficina, CodigoBarra, Quantidade } = req.body;
  console.log("REQ BODY: ",req.body);
  const results = await execSQLQuery("SELECT Id, Modelo FROM Veiculos WHERE Placa = @Placa", { Placa });
  const results1 = await execSQLQuery("SELECT Id, Item FROM Peca WHERE CodigoBarra = @CodigoBarra", { CodigoBarra });
  console.log("Veiculo SELCIONADD: ", results );
  console.log("Veiculo ID: ", results[0].Id );
  console.log("PECA SELCIONADD: ", results1 );
  console.log("Veiculo ID: ", results1[0].Id );

  await execSQLQuery(`INSERT INTO Manutencao(DataManutencao,Quantidade,Aprovacao,DataAprovacao,CPF,VeiculoId,OficinaId,PecaId,Quilometragem,KmAtual) Values(
${ Data_Manutencao }
,${ Quantidade }
,'Aprovado'
,${ Data_Manutencao }
,31575414805
,${ results[0].Id }
,${ Oficina }
,${ results1[0].Id }
,${ Km }
,${ Km })`
);
    console.log("--------------POST-------------");
    res.redirect('/PgManutencao');

});

app.get("/PgCombustivel", async (req, res) => {
    const results = await execSQLQuery("WITH TblConsumo AS (SELECT CB.Id,CB.PostoId,PC.Posto,PC.Endereco,CB.VeiculoId,CB.Completo,LEAD(CB.Completo) OVER (ORDER BY CB.Km, CB.VeiculoId) AS ComDepois,CB.Km,LEAD(CB.Km) OVER (ORDER BY CB.Km, CB.VeiculoId) AS KmDepois,LEAD(CB.Km) OVER (ORDER BY CB.Km, CB.VeiculoId) - CB.Km AS KmPercorrido,CB.LitroAbastecido,LEAD(CB.LitroAbastecido) OVER (ORDER BY CB.Km, CB.VeiculoId) AS LitrosUtilizado FROM Combustivel CB INNER JOIN PostoCombustivel PC ON PC.Id = CB.PostoId WHERE CB.VeiculoId = 14)  SELECT	TC.PostoId,TC.Posto,TC.Endereco,TC.VeiculoId,SUM(TC.KmPercorrido) AS KmPercorrido, SUM(TC.LitrosUtilizado) AS LitrosUtilizado, ROUND(SUM(TC.KmDepois - TC.Km) / NULLIF(SUM(TC.LitrosUtilizado), 0),2) AS Desempenho FROM TblConsumo TC WHERE TC.ComDepois = 'Completo' AND TC.Completo = 'Completo' GROUP BY	TC.PostoId,TC.Posto,TC.Endereco,TC.VeiculoId ORDER BY Desempenho DESC;");

    const resultPosto = await execSQLQuery("select Id, Posto from PostoCombustivel")

  res.render('PgCombustivel', { abastecido: results, PostoComb: resultPosto});

});

app.post("/PgCombustivel", async (req, res) => {
  //const { latitude, longitude } = req.body;
  //if (latitude && longitude) {
   // console.log("Latitude:", latitude);
   // console.log("Longitude:", longitude);
   // res.json({ message: "Coordenadas recebidas com sucesso", latitude, longitude });
 // } else {
  // console.log("Latitude ou longitude não recebidas.");
   // res.status(400).json({ error: "Dados de geolocalização não enviados." });
  //}
  //res.json({ message: "Coordenadas salvas com sucesso", latitude, longitude });
  const { Placa, Posto, DataAbastecimento, Km, TipoCombustível, ValorLitro, ValorAbastecido,LitroAbastecido, Completo } = req.body;
  //if (!Posto || Posto === "Selecione") {
    //return res.status(400).send("Por favor, selecione um posto válido.");
  //}
  //if (!PostoLocalizacao || PostoLocalizacao.length === 0) {
    //return res.status(400).send("Localização do posto não encontrada");
  //}
  console.log(req.body);
  console.log("PLACAsss: ", Placa);
  const PlacaID = await execSQLQuery("select Id from Veiculos where Placa = @Placa", { Placa } );
  console.log("ID DA PLACA ", PlacaID);
  //const VeiculoId = PlacaID[0].Id;
  console.log("Veiculo ID: ", VeiculoId);
  console.log("Posto: ", Posto);

  const PostoLocalizacao = await execSQLQuery("select LocalizacaoLat,LocalizacaoLong from PostoCombustivel where Id = @Posto", { Posto } );
  console.log("Localização: ", PostoLocalizacao);

  const Latitude = PostoLocalizacao[0].LocalizacaoLat;
  const Longitude = PostoLocalizacao[0].LocalizacaoLong;

  console.log("Lat: ", Latitude);
  console.log("Long: ", Longitude);
  console.log("DATA: ", DataAbastecimento);
  console.log("Km: ", Km);
  console.log("Tipo Com: ", TipoCombustível);
  console.log("Valor Litro ", ValorLitro);
  console.log("Valor Abastecido ", ValorAbastecido);
  console.log("KLitro Abastecido ", LitroAbastecido);
  console.log("Completo ", Completo);

  if(Placa){
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
  }else { console.log("Aguardando Valor") };

  const UpdateKM = await execSQLQuery("UPDATE Manutencao SET KmAtual = @Km WHERE VeiculoId = 14", { Km });

  res.redirect('/PgCombustivel');

});

app.get("/PgAutomovel", async (req, res) => {
  const resultVeiculo = await execSQLQuery("select * from Veiculos where CPF = 31575414805");

  res.render('PgAutomovel', { veiculo: resultVeiculo});

});

app.get("/PgUsuario", async (req, res) => {
  const resultUsuario = await execSQLQuery("select * from Usuario where CPF = 31575414805");

  res.render('PgUsuario', { usuario: resultUsuario});

});


app.use("/PgHome", (req, res) => {
  //Mostra a pagina principal Index
  res.render('PgHome')
  //res.json("teste");
});

app.use("/", (req, res) => {
  //Mostra a pagina principal Index
  res.render('Index')
  //res.json("teste");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});