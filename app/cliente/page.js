'use client'
// Painel do CLIENTE: agenda uma consulta, ve as proprias consultas e pode cancelar.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePerfil } from '../../lib/usePerfil'
import { CAMPOS_CONSULTA, HORARIOS, formatarDataHora, formatarHora, formatarPreco, hojeISO } from '../../lib/formatos'
import Cabecalho from '../../components/Cabecalho'
import Status from '../../components/Status'

export default function PainelCliente() {
  const perfil = usePerfil('cliente')

  const [consultas, setConsultas] = useState([])
  const [servicos, setServicos] = useState([])
  const [dentistas, setDentistas] = useState([])

  // Campos do formulario de agendamento
  const [servicoId, setServicoId] = useState('')
  const [dentistaId, setDentistaId] = useState('')
  const [dia, setDia] = useState('')
  const [hora, setHora] = useState('')
  const [ocupados, setOcupados] = useState([])

  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  // Busca as consultas do cliente (o banco so devolve as dele, por causa do RLS)
  async function carregarConsultas() {
    const { data } = await supabase
      .from('consultas')
      .select(CAMPOS_CONSULTA)
      .order('data_hora', { ascending: false })
    setConsultas(data || [])
  }

  // Ao abrir o painel: carrega consultas, servicos ativos e dentistas
  useEffect(() => {
    if (!perfil) return
    async function carregarTudo() {
      const [resServicos, resDentistas] = await Promise.all([
        supabase.from('servicos').select('*').eq('ativo', true).order('nome'),
        supabase.from('perfis').select('id, nome, especialidade').eq('papel', 'dentista').order('nome'),
      ])
      setServicos(resServicos.data || [])
      setDentistas(resDentistas.data || [])
      await carregarConsultas()
    }
    carregarTudo()
  }, [perfil])

  // Sempre que muda o dentista ou o dia, pergunta ao banco quais horarios ja estao ocupados
  useEffect(() => {
    if (!dentistaId || !dia) {
      setOcupados([])
      return
    }
    async function buscarOcupados() {
      const { data } = await supabase.rpc('horarios_ocupados', { p_dentista: dentistaId, p_dia: dia })
      setOcupados((data || []).map((valor) => formatarHora(valor)))
      setHora('')
    }
    buscarOcupados()
  }, [dentistaId, dia])

  async function agendar(evento) {
    evento.preventDefault()
    setErro('')
    setMensagem('')

    // Junta dia + hora no horario de Brasilia (-03:00)
    const dataHora = `${dia}T${hora}:00-03:00`

    if (new Date(dataHora) < new Date()) {
      setErro('Escolha um horário no futuro.')
      return
    }

    const { error } = await supabase.from('consultas').insert({
      cliente_id: perfil.id,
      dentista_id: dentistaId,
      servico_id: Number(servicoId),
      data_hora: dataHora,
    })

    if (error) {
      // 23505 = o banco recusou porque ja existe consulta nesse horario
      setErro(error.code === '23505' ? 'Esse horário acabou de ser ocupado. Escolha outro.' : 'Não foi possível agendar: ' + error.message)
      return
    }

    setMensagem('Consulta agendada.')
    setHora('')
    setOcupados([...ocupados, hora])
    carregarConsultas()
  }

  async function cancelar(consulta) {
    if (!window.confirm('Cancelar esta consulta?')) return
    const { error } = await supabase.from('consultas').update({ status: 'cancelada' }).eq('id', consulta.id)
    if (error) setErro('Não foi possível cancelar: ' + error.message)
    carregarConsultas()
  }

  if (!perfil) return <p className="carregando">Carregando...</p>

  const horariosLivres = HORARIOS.filter((horario) => !ocupados.includes(horario))

  return (
    <>
      <Cabecalho perfil={perfil} />
      <main className="conteudo">
        <h1>Olá, {perfil.nome.split(' ')[0]}</h1>

        <section className="painel">
          <h2>Agendar consulta</h2>
          <form onSubmit={agendar} className="formulario formulario-linha">
            <label>
              Procedimento
              <select value={servicoId} onChange={(e) => setServicoId(e.target.value)} required>
                <option value="">Selecione</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} ({formatarPreco(servico.preco)})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dentista
              <select value={dentistaId} onChange={(e) => setDentistaId(e.target.value)} required>
                <option value="">Selecione</option>
                {dentistas.map((dentista) => (
                  <option key={dentista.id} value={dentista.id}>
                    {dentista.nome}{dentista.especialidade ? ' · ' + dentista.especialidade : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dia
              <input type="date" value={dia} min={hojeISO()} onChange={(e) => setDia(e.target.value)} required />
            </label>
            <label>
              Horário
              <select value={hora} onChange={(e) => setHora(e.target.value)} required disabled={!dentistaId || !dia}>
                <option value="">{!dentistaId || !dia ? 'Escolha dentista e dia' : 'Selecione'}</option>
                {horariosLivres.map((horario) => (
                  <option key={horario} value={horario}>{horario}</option>
                ))}
              </select>
            </label>
            <button className="botao">Agendar</button>
          </form>
          {erro && <p className="aviso aviso-erro">{erro}</p>}
          {mensagem && <p className="aviso aviso-ok">{mensagem}</p>}
        </section>

        <section className="painel">
          <h2>Minhas consultas</h2>
          {consultas.length === 0 ? (
            <p className="vazio">Você ainda não tem consultas.</p>
          ) : (
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Procedimento</th>
                    <th>Dentista</th>
                    <th>Status</th>
                    <th>Observações do dentista</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {consultas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td>{formatarDataHora(consulta.data_hora)}</td>
                      <td>{consulta.servico.nome}</td>
                      <td>{consulta.dentista.nome}</td>
                      <td><Status valor={consulta.status} /></td>
                      <td>{consulta.observacoes || '-'}</td>
                      <td>
                        {(consulta.status === 'agendada' || consulta.status === 'confirmada') && (
                          <button className="botao botao-perigo" onClick={() => cancelar(consulta)}>Cancelar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
