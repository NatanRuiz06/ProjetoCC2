import { catalogoEstacoes } from './estacoes.js?v=20261029a';

const amostras = Object.freeze([
  { id: 'sao-paulo', condicao: 'Parcialmente nublado',
    temperatura: 23, umidade: 64 },
  { id: 'campinas', condicao: 'Parcialmente nublado',
    temperatura: 25, umidade: 59 },
  { id: 'sorocaba', condicao: 'Ensolarado',
    temperatura: 26, umidade: 54 },
  { id: 'santos', condicao: 'Chuva leve',
    temperatura: 24, umidade: 78 },
  { id: 'curitiba', condicao: 'Nublado',
    temperatura: 17, umidade: 72 },
].map(Object.freeze));
export const localidades = Object.freeze(catalogoEstacoes.map(estacao => Object.freeze({
  ...amostras.find(item => item.id === estacao.id), ...estacao,
})));

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function filtrarLocalidades(consulta) {
  const termo = normalizar(consulta);
  return localidades.filter(local => normalizar(`${local.nome} ${local.uf}`).includes(termo));
}
