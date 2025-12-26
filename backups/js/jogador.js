// pegar id da URL: jogador.html?id=gerbito
const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

// elementos principais
const nomeEl = document.getElementById("nome");
const descCurtaEl = document.getElementById("descricao-curta");
const fotoEl = document.getElementById("foto-jogador");
const legendaFotoEl = document.getElementById("legenda-foto");

// elementos da infobox
const nomeCompletoEl = document.getElementById("nome-completo");
const dataNascEl = document.getElementById("data-nascimento");
const localNascEl = document.getElementById("local-nascimento");
const nacionalidadeEl = document.getElementById("nacionalidade");
const alturaEl = document.getElementById("altura");
const peEl = document.getElementById("pe");
const apelidoEl = document.getElementById("apelido");

const clubeAtualEl = document.getElementById("clube-atual");
const numeroEl = document.getElementById("numero");
const posicaoEl = document.getElementById("posicao");
const outrasPosicoesEl = document.getElementById("outras-posicoes");

const clubesJuventudeBody = document.getElementById("clubes-juventude-body");
const clubesProfBody = document.getElementById("clubes-profissionais-body");
const selecaoBody = document.getElementById("selecao-nacional-body");

// Se não tiver ID → erro
if (!playerId) {
  nomeEl.textContent = "Jogador não encontrado";
} else {
  carregarJogador(playerId);
}

function carregarJogador(id) {
  fetch("data/jogadores.json")
    .then((res) => res.json())
    .then((jogadores) => {
      const data = jogadores.find((j) => j.id === id);

      if (!data) {
        nomeEl.textContent = "Jogador não encontrado";
        return;
      }

      preencherPagina(data);
    })
    .catch((err) => {
      console.error("Erro ao carregar jogadores.json", err);
      nomeEl.textContent = "Erro ao carregar dados do jogador";
    });
}

// ---------------- CÁLCULO AUTOMÁTICO DE IDADE ----------------
function calcularIdade(dataIso) {
  if (!dataIso) return null;

  const hoje = new Date();
  const [ano, mes, dia] = dataIso.split("-").map(Number);

  let idade = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();

  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  return idade;
}

// --------- PARSE GENÉRICO PARA "ANOS / CLUBE" DA BASE ---------
function parsePeriodoClube(item) {
  // Se já vier como objeto { anos, clube }, só devolve formatado
  if (typeof item === "object" && item !== null) {
    return {
      anos: item.anos || "",
      clube: item.clube || "",
    };
  }

  let entry = String(item).trim();

  // Caso 1: "2008–2016 — Norte44" ou "2008-2016 - Norte44"
  // (começa com ano)
  let match1 = entry.match(/^(\d{4}.*?)(?:\s+—\s+|\s+-\s+)(.+)$/);
  if (match1) {
    return {
      anos: match1[1].trim(),
      clube: match1[2].trim(),
    };
  }

  // Caso 2: "Norte44 (2008–2016)" ou "(2008-2016)", "(2014 - Presente)" etc
  let match2 = entry.match(/^(.+?)\s+\(([^)]+)\)$/);
  if (match2) {
    return {
      anos: match2[2].trim(),
      clube: match2[1].trim(),
    };
  }

  // Caso 3: não identificou padrão → mostra tudo como clube
  return {
    anos: "",
    clube: entry,
  };
}

// ---------------- PREENCHER PÁGINA ----------------
function preencherPagina(data) {
  // Título da aba
  document.title = `${data.nome_curto || data.nome_completo} – Norte44 Wiki`;

  // Topo (nome e descrição)
  nomeEl.textContent = data.nome_curto || data.nome_completo || "Jogador";
  descCurtaEl.textContent = data.descricao_curta || "";

  // Foto e legenda
  legendaFotoEl.textContent =
    data.legenda_imagem || `Imagem de ${data.nome_curto || data.nome_completo}`;

  const caminhoImg = `img/${data.id}.png`;
  fotoEl.src = caminhoImg;
  fotoEl.alt = `Foto de ${data.nome_curto || data.nome_completo}`;
  fotoEl.onerror = () => {
    fotoEl.src = "img/default.png";
  };

  // ---------------- INFORMAÇÕES PESSOAIS ----------------
  nomeCompletoEl.textContent = data.nome_completo || "—";

  const idade = calcularIdade(data.data_nascimento_iso);
  if (data.data_nascimento_texto) {
    dataNascEl.textContent = idade
      ? `${data.data_nascimento_texto} (${idade} anos)`
      : data.data_nascimento_texto;
  } else {
    dataNascEl.textContent = "—";
  }

  localNascEl.textContent = data.local_nascimento || "—";
  nacionalidadeEl.textContent = data.nacionalidade || "—";
  alturaEl.textContent = data.altura || "—";
  peEl.textContent = data.pe || "—";

  // --- Ocultar Apelido se estiver vazio ---
  if (data.apelido && data.apelido.trim() !== "") {
    apelidoEl.textContent = data.apelido;
  } else {
    const rowApelido = document.getElementById("row-apelido");
    if (rowApelido) rowApelido.style.display = "none";
  }

  // ---------------- INFORMAÇÕES PROFISSIONAIS ----------------
  clubeAtualEl.textContent = data.clube_atual || "—";
  numeroEl.textContent = data.numero || "—";
  posicaoEl.textContent = data.posicao || "—";

  // --- Ocultar Outras Posições se vazio ---
  if (data.outras_posicoes && data.outras_posicoes.length > 0) {
    outrasPosicoesEl.textContent = data.outras_posicoes.join(", ");
  } else {
    const rowOutras = document.getElementById("row-outras-posicoes");
    if (rowOutras) rowOutras.style.display = "none";
  }

  // ---------------- CATEGORIA DE BASE ----------------
  clubesJuventudeBody.innerHTML = "";
  if (data.clubes_juventude && data.clubes_juventude.length > 0) {
    data.clubes_juventude.forEach((item) => {
      const info = parsePeriodoClube(item);

      const tr = document.createElement("tr");
      const tdAnos = document.createElement("td");
      const tdClube = document.createElement("td");

      tdAnos.textContent = info.anos;
      tdClube.textContent = info.clube;

      tr.appendChild(tdAnos);
      tr.appendChild(tdClube);
      clubesJuventudeBody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.textContent = "—";
    tr.appendChild(td);
    clubesJuventudeBody.appendChild(tr);
  }

  // ---------------- CLUBES PROFISSIONAIS ----------------
  clubesProfBody.innerHTML = "";
  if (data.clubes_profissionais && data.clubes_profissionais.length > 0) {
    data.clubes_profissionais.forEach((c) => {
      const tr = document.createElement("tr");

      const tdAnos = document.createElement("td");
      const tdClube = document.createElement("td");
      const tdJogos = document.createElement("td");

      // Anos
      tdAnos.textContent = c.anos || "";

      // Clube: se for empréstimo, coloca setinha e (emp.)
      if (c.emprestimo) {
        tdClube.textContent = `→ ${c.clube} (emp.)`;
      } else {
        tdClube.textContent = c.clube || "";
      }

      // Jogos e gols
      tdJogos.textContent = c.jogos_gols || "";

      tr.appendChild(tdAnos);
      tr.appendChild(tdClube);
      tr.appendChild(tdJogos);
      clubesProfBody.appendChild(tr);
    });
  }

  // ---------------- SELEÇÃO NACIONAL ----------------
  selecaoBody.innerHTML = "";
  if (data.selecao_nacional && data.selecao_nacional.length > 0) {
    data.selecao_nacional.forEach((s) => {
      const tr = document.createElement("tr");

      const tdAnos = document.createElement("td");
      const tdSel = document.createElement("td");
      const tdJogos = document.createElement("td");

      tdAnos.textContent = s.anos || "";
      tdSel.textContent = s.selecao || "";
      tdJogos.textContent = s.jogos_gols || "";

      tr.appendChild(tdAnos);
      tr.appendChild(tdSel);
      tr.appendChild(tdJogos);
      selecaoBody.appendChild(tr);
    });
  }
}
