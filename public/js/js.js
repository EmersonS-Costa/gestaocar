// Função que é chamada sempre que o usuário digita algo no campo codigo barra
function enviarCodigoBarraAutomaticamente() {
  var CodigoBarras = document.getElementById("CodigoBarra").value;
  if (CodigoBarras) {
    window.location.href = `/PgManutencao?CodigoBarra=${encodeURIComponent(CodigoBarras)}`;
  }
}
function CodigoBarraEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita o comportamento padrão de submit
    enviarCodigoBarraAutomaticamente(); // Chama a função de envio
}
}

// Função que é chamada sempre que o usuário digita algo no campo Placa
function enviarPlaca() {
  var Placa = document.getElementById("Placa").value;
  if (Placa) {
    window.location.href = `/PgManutencao?Placa=${encodeURIComponent(Placa)}`;
  }
}
function PlacaEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita o comportamento padrão de submit
    enviarPlaca(); // Chama a função de envio
}
}

