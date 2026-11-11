// Funcoes pequenas para mostrar datas, horas e dinheiro no padrao brasileiro.
const FUSO = 'America/Sao_Paulo'

export function formatarDataHora(valor) {
  return new Date(valor).toLocaleString('pt-BR', {
    timeZone: FUSO,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatarHora(valor) {
  return new Date(valor).toLocaleTimeString('pt-BR', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Data de hoje no formato AAAA-MM-DD (o formato do <input type="date">)
export function hojeISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: FUSO })
}

// Horarios de atendimento da clinica
export const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export const NOMES_STATUS = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

// Texto usado nas consultas para trazer junto o nome do cliente, do dentista e do servico
export const CAMPOS_CONSULTA = `
  id, data_hora, status, observacoes,
  cliente:perfis!consultas_cliente_id_fkey ( id, nome, telefone ),
  dentista:perfis!consultas_dentista_id_fkey ( id, nome, especialidade ),
  servico:servicos ( id, nome, preco, duracao_min )
`
