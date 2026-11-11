'use client'
// Painel do DENTISTA: ve a propria agenda, confirma, conclui ou cancela
// consultas e registra observacoes do atendimento.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePerfil } from '../../lib/usePerfil'
import { CAMPOS_CONSULTA, formatarDataHora, formatarDiaMes } from '../../lib/formatos'
import Cabecalho from '../../components/Cabecalho'
import Status from '../../components/Status'
import Faixa, { Icone } from '../../components/Faixa'

export default function PainelDentista() {
  const perfil = usePerfil('dentista')

  const [consultas, setConsultas] = useState([])
  const [filtro, setFiltro] = useState('proximas')
  const [anotacoes, setAnotacoes] = useState({}) // texto digitado em cada consulta
  const [erro, setErro] = useState('')

  // O banco so devolve as consultas em que este dentista e o responsavel (RLS)
  async function carregarConsultas() {
    const { data } = await supabase
      .from('consultas')
      .select(CAMPOS_CONSULTA)
      .order('data_hora', { ascending: true })
    setConsultas(data || [])
  }

  useEffect(() => {
    if (perfil) carregarConsultas()
  }, [perfil])

  async function mudarStatus(consulta, novoStatus) {
    setErro('')
    const { error } = await supabase.from('consultas').update({ status: novoStatus }).eq('id', consulta.id)
    if (error) setErro('Não foi possível atualizar: ' + error.message)
    carregarConsultas()
  }

  async function salvarObservacao(consulta) {
    setErro('')
    const texto = anotacoes[consulta.id] ?? consulta.observacoes ?? ''
    const { error } = await supabase.from('consultas').update({ observacoes: texto }).eq('id', consulta.id)
    if (error) setErro('Não foi possível salvar: ' + error.message)
    carregarConsultas()
  }

  if (!perfil) return <p className="carregando">Carregando...</p>

  const ativas = consultas.filter((c) => c.status === 'agendada' || c.status === 'confirmada')
  const visiveis = filtro === 'proximas' ? ativas : consultas

  return (
    <div className="pp">
      <Cabecalho perfil={perfil} />
      <Faixa
        rotulo={'Painel do dentista' + (perfil.especialidade ? ' · ' + perfil.especialidade : '')}
        titulo="Minha agenda"
        texto={ativas.length === 0
          ? 'Nenhuma consulta a atender no momento.'
          : ativas.length === 1 ? 'Você tem 1 consulta a atender.' : 'Você tem ' + ativas.length + ' consultas a atender.'}
      />
      <main className="conteudo">

        <div className="resumo">
          <div className="resumo-item"><Icone nome="relogio" /><strong>{ativas.length}</strong><span>a atender</span></div>
          <div className="resumo-item"><Icone nome="certo" /><strong>{consultas.filter((c) => c.status === 'concluida').length}</strong><span>concluídas</span></div>
          <div className="resumo-item"><Icone nome="cancelado" /><strong>{consultas.filter((c) => c.status === 'cancelada').length}</strong><span>canceladas</span></div>
        </div>

        <div className="abas">
          <button className={filtro === 'proximas' ? 'aba aba-ativa' : 'aba'} onClick={() => setFiltro('proximas')}>A atender</button>
          <button className={filtro === 'todas' ? 'aba aba-ativa' : 'aba'} onClick={() => setFiltro('todas')}>Todas</button>
        </div>

        {erro && <p className="aviso aviso-erro">{erro}</p>}

        {visiveis.length === 0 ? (
          <p className="vazio">Nenhuma consulta nesta lista.</p>
        ) : (
          <div className="lista-consultas">
            {visiveis.map((consulta) => (
              <article key={consulta.id} className="painel consulta">
                <div className="consulta-topo">
                  <div className="selo-data" aria-hidden="true">
                    <b>{formatarDiaMes(consulta.data_hora).dia}</b>
                    <span>{formatarDiaMes(consulta.data_hora).mes}</span>
                  </div>
                  <div className="consulta-dados">
                    <strong>{formatarDataHora(consulta.data_hora)}</strong>
                    <p>{consulta.servico.nome} · {consulta.servico.duracao_min} min</p>
                    <p>Paciente: {consulta.cliente.nome}{consulta.cliente.telefone ? ' · ' + consulta.cliente.telefone : ''}</p>
                  </div>
                  <Status valor={consulta.status} />
                </div>

                <label>
                  Observações do atendimento
                  <textarea
                    rows={2}
                    value={anotacoes[consulta.id] ?? consulta.observacoes ?? ''}
                    onChange={(e) => setAnotacoes({ ...anotacoes, [consulta.id]: e.target.value })}
                  />
                </label>

                <div className="acoes">
                  <button className="botao botao-claro" onClick={() => salvarObservacao(consulta)}>Salvar observação</button>
                  {consulta.status === 'agendada' && (
                    <button className="botao" onClick={() => mudarStatus(consulta, 'confirmada')}>Confirmar</button>
                  )}
                  {(consulta.status === 'agendada' || consulta.status === 'confirmada') && (
                    <>
                      <button className="botao" onClick={() => mudarStatus(consulta, 'concluida')}>Concluir</button>
                      <button className="botao botao-perigo" onClick={() => mudarStatus(consulta, 'cancelada')}>Cancelar</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
