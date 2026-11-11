'use client'
// Painel do ADMIN (dono da clinica): ve tudo.
// Abas: resumo, todas as consultas, usuarios (define quem e dentista) e servicos.
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePerfil } from '../../lib/usePerfil'
import { CAMPOS_CONSULTA, NOMES_STATUS, formatarDataHora, formatarPreco } from '../../lib/formatos'
import Cabecalho from '../../components/Cabecalho'
import Status from '../../components/Status'

const ABAS = [
  { id: 'resumo', nome: 'Resumo' },
  { id: 'consultas', nome: 'Consultas' },
  { id: 'usuarios', nome: 'Usuários' },
  { id: 'servicos', nome: 'Serviços' },
]

export default function PainelAdmin() {
  const perfil = usePerfil('admin')

  const [aba, setAba] = useState('resumo')
  const [consultas, setConsultas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [servicos, setServicos] = useState([])
  const [erro, setErro] = useState('')

  // Formulario de novo servico
  const [nomeServico, setNomeServico] = useState('')
  const [duracao, setDuracao] = useState(30)
  const [preco, setPreco] = useState('')

  // Como o usuario logado e admin, as regras do banco liberam todas as linhas
  async function carregarTudo() {
    const [resConsultas, resUsuarios, resServicos] = await Promise.all([
      supabase.from('consultas').select(CAMPOS_CONSULTA).order('data_hora', { ascending: false }),
      supabase.from('perfis').select('*').order('nome'),
      supabase.from('servicos').select('*').order('nome'),
    ])
    setConsultas(resConsultas.data || [])
    setUsuarios(resUsuarios.data || [])
    setServicos(resServicos.data || [])
  }

  useEffect(() => {
    if (perfil) carregarTudo()
  }, [perfil])

  // Executa uma alteracao no banco, mostra erro se houver e recarrega as listas
  async function executar(operacao) {
    setErro('')
    const { error } = await operacao
    if (error) {
      setErro(error.code === '23503'
        ? 'Este item já foi usado em consultas e não pode ser apagado. Desative em vez de apagar.'
        : 'Não foi possível salvar: ' + error.message)
    }
    carregarTudo()
  }

  // ----- Consultas -----
  function mudarStatus(consulta, status) {
    executar(supabase.from('consultas').update({ status }).eq('id', consulta.id))
  }

  function apagarConsulta(consulta) {
    if (!window.confirm('Apagar esta consulta definitivamente?')) return
    executar(supabase.from('consultas').delete().eq('id', consulta.id))
  }

  // ----- Usuarios -----
  function mudarPapel(usuario, papel) {
    if (usuario.id === perfil.id) {
      setErro('Você não pode mudar o seu próprio papel.')
      return
    }
    executar(supabase.from('perfis').update({ papel }).eq('id', usuario.id))
  }

  function mudarEspecialidade(usuario, especialidade) {
    if (especialidade === (usuario.especialidade || '')) return
    executar(supabase.from('perfis').update({ especialidade }).eq('id', usuario.id))
  }

  // ----- Servicos -----
  async function criarServico(evento) {
    evento.preventDefault()
    await executar(supabase.from('servicos').insert({
      nome: nomeServico,
      duracao_min: Number(duracao),
      preco: Number(preco),
    }))
    setNomeServico('')
    setPreco('')
  }

  function alternarServico(servico) {
    executar(supabase.from('servicos').update({ ativo: !servico.ativo }).eq('id', servico.id))
  }

  function apagarServico(servico) {
    if (!window.confirm('Apagar o serviço "' + servico.nome + '"?')) return
    executar(supabase.from('servicos').delete().eq('id', servico.id))
  }

  if (!perfil) return <p className="carregando">Carregando...</p>

  // Numeros do resumo
  const contar = (papel) => usuarios.filter((u) => u.papel === papel).length
  const faturamento = consultas
    .filter((c) => c.status === 'concluida')
    .reduce((total, c) => total + Number(c.servico.preco), 0)

  return (
    <>
      <Cabecalho perfil={perfil} />
      <main className="conteudo">
        <h1>Administração da clínica</h1>

        <div className="abas">
          {ABAS.map((item) => (
            <button key={item.id} className={aba === item.id ? 'aba aba-ativa' : 'aba'} onClick={() => setAba(item.id)}>
              {item.nome}
            </button>
          ))}
        </div>

        {erro && <p className="aviso aviso-erro">{erro}</p>}

        {aba === 'resumo' && (
          <>
            <div className="resumo">
              <div className="resumo-item"><strong>{consultas.length}</strong><span>consultas no total</span></div>
              <div className="resumo-item"><strong>{consultas.filter((c) => c.status === 'agendada' || c.status === 'confirmada').length}</strong><span>a realizar</span></div>
              <div className="resumo-item"><strong>{contar('dentista')}</strong><span>dentistas</span></div>
              <div className="resumo-item"><strong>{contar('cliente')}</strong><span>clientes</span></div>
              <div className="resumo-item"><strong>{formatarPreco(faturamento)}</strong><span>em consultas concluídas</span></div>
            </div>
            <section className="painel">
              <h2>Como este painel funciona</h2>
              <p>
                O dono enxerga todas as consultas, define quem é dentista na aba Usuários e mantém a
                lista de serviços e preços. Dentistas só veem a própria agenda e clientes só veem as
                próprias consultas: essa separação é feita pelas regras de acesso do banco de dados.
              </p>
            </section>
          </>
        )}

        {aba === 'consultas' && (
          <section className="painel">
            <h2>Todas as consultas</h2>
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr><th>Data</th><th>Cliente</th><th>Dentista</th><th>Procedimento</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {consultas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td>{formatarDataHora(consulta.data_hora)}</td>
                      <td>{consulta.cliente.nome}</td>
                      <td>{consulta.dentista.nome}</td>
                      <td>{consulta.servico.nome}</td>
                      <td>
                        <select value={consulta.status} onChange={(e) => mudarStatus(consulta, e.target.value)} aria-label="Status da consulta">
                          {Object.keys(NOMES_STATUS).map((status) => (
                            <option key={status} value={status}>{NOMES_STATUS[status]}</option>
                          ))}
                        </select>
                      </td>
                      <td><button className="botao botao-perigo" onClick={() => apagarConsulta(consulta)}>Apagar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {aba === 'usuarios' && (
          <section className="painel">
            <h2>Usuários</h2>
            <p className="texto-menor">
              Para cadastrar um dentista: ele cria a conta em "Criar conta" e você muda o papel dele aqui.
            </p>
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Papel</th><th>Especialidade</th></tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.telefone || '-'}</td>
                      <td>
                        <select value={usuario.papel} onChange={(e) => mudarPapel(usuario, e.target.value)} aria-label="Papel do usuário">
                          <option value="cliente">Cliente</option>
                          <option value="dentista">Dentista</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                      <td>
                        {usuario.papel === 'dentista' ? (
                          <input
                            defaultValue={usuario.especialidade || ''}
                            placeholder="Ex.: Ortodontia"
                            onBlur={(e) => mudarEspecialidade(usuario, e.target.value)}
                            aria-label="Especialidade"
                          />
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {aba === 'servicos' && (
          <section className="painel">
            <h2>Serviços</h2>
            <form onSubmit={criarServico} className="formulario formulario-linha">
              <label>
                Nome
                <input value={nomeServico} onChange={(e) => setNomeServico(e.target.value)} required />
              </label>
              <label>
                Duração (min)
                <input type="number" min="5" step="5" value={duracao} onChange={(e) => setDuracao(e.target.value)} required />
              </label>
              <label>
                Preço (R$)
                <input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              </label>
              <button className="botao">Adicionar</button>
            </form>

            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr><th>Serviço</th><th>Duração</th><th>Preço</th><th>Situação</th><th></th></tr>
                </thead>
                <tbody>
                  {servicos.map((servico) => (
                    <tr key={servico.id}>
                      <td>{servico.nome}</td>
                      <td>{servico.duracao_min} min</td>
                      <td>{formatarPreco(servico.preco)}</td>
                      <td>{servico.ativo ? 'Ativo' : 'Desativado'}</td>
                      <td className="acoes">
                        <button className="botao botao-claro" onClick={() => alternarServico(servico)}>
                          {servico.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className="botao botao-perigo" onClick={() => apagarServico(servico)}>Apagar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
