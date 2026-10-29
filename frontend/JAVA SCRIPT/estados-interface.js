import { estados } from './estados.js?v=20261029a';
import { icone } from './icones.js?v=20261029a';
export function mostrarEstado(container, estado) {
  const dados = { ...estados[estado.tipo], ...estado };
  container.dataset.estado = estado.tipo;
  container.innerHTML = `${icone(dados.icone)}<div><strong></strong><p></p></div>`;
  container.querySelector('strong').textContent = dados.titulo;
  container.querySelector('p').textContent = dados.texto;
  if (dados.destino && dados.acao) {
    const link = document.createElement('a');
    link.href = dados.destino; link.textContent = dados.acao;
    container.append(link);
  }
  return dados;
}
