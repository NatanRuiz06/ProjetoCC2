import { validarData, validarId, obterLeituraRecente, obterHistorico } from './api.js?v=20261029a';
import { normalizarLeitura, normalizarHistorico } from './leituras.js?v=20261029a';
import { estadoDaLeitura, estadoDaFalha } from './estados.js?v=20261029a';
function validarOrigem(recebido, id) {
  if (recebido?.estacao_id !== undefined && recebido.estacao_id !== id)
    throw new Error('A resposta não pertence à estação selecionada.');
}
export function interpretarResultados(resultados, id) {
  let leitura = null, historico = [], estado, falhaHistorico = null;
  try {
    if (resultados[0].status === 'rejected') throw resultados[0].reason;
    const recebido = resultados[0].value;
    validarOrigem(recebido, id);
    leitura = recebido === null ? null : normalizarLeitura(recebido);
    estado = estadoDaLeitura(leitura);
  } catch (erro) { estado = estadoDaFalha(erro); }
  try {
    if (resultados[1].status === 'rejected') throw resultados[1].reason;
    const recebido = resultados[1].value;
    if (Array.isArray(recebido)) recebido.forEach(item => validarOrigem(item, id));
    historico = normalizarHistorico(recebido);
  } catch (erro) { falhaHistorico = estadoDaFalha(erro).tipo; }
  return { leitura, historico, estado, falhaHistorico };
}
export async function consultarEstacao(estacao, consulta) {
  validarId(estacao.apiId);
  validarData(consulta.data);
  const resultados = await Promise.allSettled([
    obterLeituraRecente(estacao.apiId, consulta.signal), obterHistorico(estacao.apiId, consulta),
  ]);
  return interpretarResultados(resultados, estacao.apiId);
}
