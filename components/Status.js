import { NOMES_STATUS } from '../lib/formatos'

// Etiqueta colorida com o status da consulta
export default function Status({ valor }) {
  return <span className={'etiqueta status-' + valor}>{NOMES_STATUS[valor]}</span>
}
