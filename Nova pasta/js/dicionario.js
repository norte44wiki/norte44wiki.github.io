const listaElement = document.getElementById("lista-jogadores");
const buscaInput = document.getElementById("busca");

let jogadores = [];

// carrega o JSON de jogadores
fetch("data/jogadores.json")
  .then((res) => res.json())
  .then((data) => {
    jogadores = data;
    renderLista(jogadores);
  })
  .catch((err) => {
    console.error("Erro ao carregar jogadores.json", err);
    listaElement.innerHTML = "<li>Erro ao carregar lista de jogadores.</li>";
  });

function renderLista(items) {
  listaElement.innerHTML = "";

  if (!items || items.length === 0) {
    listaElement.innerHTML = "<li>Nenhum jogador encontrado.</li>";
    return;
  }

  items.forEach((j) => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = `jogador.html?id=${j.id}`;
    link.textContent = j.nome_curto || j.nome_completo;

    const extra = document.createElement("span");
    extra.className = "item-info-extra";
    extra.textContent = ` ${j.posicao || ""} – ${j.clube_atual || ""}`;

    li.appendChild(link);
    li.appendChild(extra);
    listaElement.appendChild(li);
  });
}

// filtro de busca
buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase();

  const filtrados = jogadores.filter((j) => {
    const nome = (j.nome_completo || "").toLowerCase();
    const apelido = (j.nome_curto || "").toLowerCase();
    const clube = (j.clube_atual || "").toLowerCase();
    const posicao = (j.posicao || "").toLowerCase();

    return (
      nome.includes(termo) ||
      apelido.includes(termo) ||
      clube.includes(termo) ||
      posicao.includes(termo)
    );
  });

  renderLista(filtrados);
});
