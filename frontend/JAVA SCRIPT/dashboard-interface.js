import { mostrarEstado } from './estados-interface.js?v=20261029a';
import { icone } from './icones.js?v=20261029a';
import { campos, numero, formatarHorario, classificar } from './leituras.js?v=20261029a';
import { desenharGrafico } from './grafico-temperatura.js?v=20261029a';
export const elemento = id => document.getElementById(id);
export const escrever = (id, texto) => { elemento(id).textContent = texto; };
const unidades = { temperatura: '°C', umidade: '%', pressao: 'hPa', ar: '', luminosidade: 'lx' };
function linha(valores) {
  const tr = document.createElement('tr');
  valores.forEach(valor => { const td = document.createElement('td'); td.textContent = valor; tr.append(td); });
  return tr;
}
export function mostrarSituacao(estado) {
  const dados = mostrarEstado(elemento('estado-dashboard'), estado);
  const botao = elemento('recarregar');
  botao.innerHTML = `${icone('refresh')}<span></span>`;
  botao.querySelector('span').textContent = dados.destino ? 'Atualizar dados' : dados.acao || 'Consultando…';
  botao.disabled = estado.tipo === 'loading' || Boolean(dados.destino);
  escrever('anuncio-dashboard', `${dados.titulo}. ${dados.texto}`);
}
export function mostrarLeitura(item) {
  campos.forEach(campo => {
    escrever(`metrica-${campo}`, numero(item?.[campo]));
    elemento(`metrica-${campo}`).toggleAttribute('data-indisponivel', !Number.isFinite(item?.[campo]));
  });
  document.querySelector('.nota-unidade').dataset.leituraDisponivel = String(Number.isFinite(item?.ar));
  escrever('ultima-leitura', formatarHorario(item?.horario));
  elemento('ultima-leitura').dateTime = item?.horario || '';
  escrever('resumo-umidade', Number.isFinite(item?.umidade) ? `${numero(item.umidade)} %` : 'Indisponível');
  escrever('resumo-texto', Number.isFinite(item?.umidade) ? classificar('umidade', item.umidade) : 'Aguardando medições para interpretação.');
}
export function mostrarHistorico(registros, contexto) {
  const serie = registros.filter(item => item.horario && Number.isFinite(item.temperatura));
  const valores = registros.map(item => item.temperatura).filter(Number.isFinite);
  const nota = document.querySelector('.nota-unidade');
  nota.hidden = nota.dataset.leituraDisponivel !== 'true' && !registros.some(item => Number.isFinite(item.ar));
  escrever('resumo-minima', valores.length ? `${numero(valores.reduce((minimo, valor) => Math.min(minimo, valor), Infinity))} °C` : 'Indisponível');
  escrever('resumo-maxima', valores.length ? `${numero(valores.reduce((maximo, valor) => Math.max(maximo, valor), -Infinity))} °C` : 'Indisponível');
  escrever('titulo-grafico', `Temperatura — ${contexto.data}`);
  escrever('subtitulo-grafico', `${contexto.nome} · ${registros.length} leituras`);
  escrever('resumo-grafico', registros.length ? `${serie.length} amostras com temperatura e horário válidos.` : 'Histórico vazio.');
  desenharGrafico(serie, { nome: contexto.nome, periodo: '24h' });
  elemento('tabela-serie').replaceChildren(...serie.map(item => linha([formatarHorario(item.horario), numero(item.temperatura)])));
  escrever('legenda-serie', `${contexto.nome} · ${contexto.data} · horários em Brasília`);
  escrever('legenda-medicoes', `${contexto.nome} · ${contexto.data}`);
  mostrarTabela(registros, contexto.limite);
  mostrarDisponibilidadeHistorico(serie, contexto.situacao);
}
export function mostrarTabela(registros, limite) {
  elemento('expandir-medicoes').hidden = registros.length <= 3;
  elemento('expandir-medicoes').setAttribute('aria-expanded', String(limite !== 3));
  escrever('expandir-medicoes', limite === 3 ? 'Ver todas as amostras' : 'Mostrar últimas três');
  elemento('registros-medicoes').replaceChildren(...[...registros].reverse().slice(0, limite).map(item =>
    linha([formatarHorario(item.horario), ...['temperatura', 'umidade', 'pressao', 'ar'].map(campo =>
      Number.isFinite(item[campo]) ? `${numero(item[campo])} ${unidades[campo]}` : 'Indisponível')])));
}

function mostrarDisponibilidadeHistorico(serie, situacao) {
  const textos = { loading: 'Consultando o histórico…', empty: 'Nenhum registro nesta data. Escolha outra data.',
    error: 'Histórico não atualizado. Use o botão de atualização para tentar novamente.',
    offline: 'Histórico indisponível enquanto o serviço não responde.',
    unconfigured: 'O histórico ficará disponível quando houver leituras desta localidade.' };
  elemento('grafico').toggleAttribute('hidden', !serie.length);
  elemento('leitura-grafico').hidden = !serie.length;
  elemento('resumo-grafico').textContent = serie.length ? `${serie.length} amostras válidas · origem: API.`
    : textos[situacao] || 'Não há amostras com temperatura e horário válidos para desenhar o gráfico.';
}
