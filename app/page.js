'use client'
// Pagina inicial (publica). Apresenta a clinica e leva para login ou cadastro.
// A parte interativa e o odontograma: o desenho das duas arcadas, que destaca
// os dentes envolvidos em cada tratamento quando o visitante escolhe um servico.
import { useState } from 'react'
import Link from 'next/link'
import Logo from '../components/Logo'

// Cada servico diz quais dentes destacar. As arcadas tem 16 dentes cada,
// numerados de 0 a 15 da esquerda para a direita.
const TODOS = [...Array(16).keys()]
const FRENTE = [5, 6, 7, 8, 9, 10]

const SERVICOS = [
  { id: 'avaliacao', nome: 'Avaliação inicial', texto: 'Primeira consulta. O dentista examina a boca inteira e monta o plano de tratamento.', tempo: '30 min', cima: TODOS, baixo: TODOS },
  { id: 'limpeza', nome: 'Limpeza', texto: 'Profilaxia completa, com remoção de placa e tártaro em todos os dentes.', tempo: '45 min', cima: TODOS, baixo: TODOS },
  { id: 'ortodontia', nome: 'Ortodontia', texto: 'Aparelho fixo e manutenção mensal para alinhar as duas arcadas.', tempo: '30 min', cima: TODOS, baixo: TODOS },
  { id: 'clareamento', nome: 'Clareamento', texto: 'Tratamento estético feito no consultório, nos dentes que aparecem no sorriso.', tempo: '60 min', cima: FRENTE, baixo: FRENTE },
  { id: 'restauracao', nome: 'Restauração', texto: 'Recuperação de um dente com cárie ou fratura, mais comum nos molares.', tempo: '60 min', cima: [2], baixo: [13] },
  { id: 'implantes', nome: 'Implantes', texto: 'Reposição de um dente perdido, com planejamento individual.', tempo: '45 min', cima: [], baixo: [3] },
]

const PASSOS = [
  { titulo: 'Crie sua conta', texto: 'Nome, telefone, e-mail e uma senha. Leva menos de um minuto.' },
  { titulo: 'Escolha dentista, dia e horário', texto: 'O site mostra só os horários que ainda estão livres.' },
  { titulo: 'Acompanhe pelo painel', texto: 'Veja se a consulta foi confirmada, leia as observações do dentista e cancele se precisar.' },
]

const EQUIPE = [
  { iniciais: 'AR', nome: 'Dra. Ana Ribeiro', area: 'Ortodontia' },
  { iniciais: 'PN', nome: 'Dr. Paulo Nogueira', area: 'Implantodontia' },
]

const AGENDA = [
  { hora: '08:00', livre: false },
  { hora: '09:00', livre: true },
  { hora: '10:00', livre: false },
  { hora: '11:00', livre: true },
  { hora: '13:00', livre: true },
]

// Largura e altura de cada dente conforme o tipo: molar, pre-molar, canino, incisivo
function tamanho(i) {
  const posicao = i < 8 ? i : 15 - i
  if (posicao <= 2) return [26, 30]
  if (posicao <= 4) return [21, 27]
  if (posicao === 5) return [18, 30]
  return [17, 26]
}

// Desenha uma arcada: 16 dentes distribuidos sobre meia elipse
function Arcada({ lado, destaque, servico }) {
  const cx = 180
  const cy = lado === 'cima' ? 178 : 202
  const rx = 138
  const ry = 132
  const sinal = lado === 'cima' ? -1 : 1

  return (
    <g>
      {TODOS.map((i) => {
        const angulo = Math.PI - (Math.PI * (i + 0.5)) / 16
        const x = cx + rx * Math.cos(angulo)
        const y = cy + sinal * ry * Math.sin(angulo)
        const giro = (Math.atan2(sinal * ry * Math.sin(angulo), rx * Math.cos(angulo)) * 180) / Math.PI + 90
        const [largura, altura] = tamanho(i)
        const ativo = destaque.includes(i)
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${giro})`} style={{ '--ordem': i }}>
            <rect
              className={'dente' + (ativo ? ' dente-ativo dente-' + servico : '')}
              x={-largura / 2}
              y={-altura / 2}
              width={largura}
              height={altura}
              rx={largura / 2.4}
            />
            {ativo && servico === 'ortodontia' && <rect className="braquete" x="-4" y="-4" width="8" height="8" rx="1.5" />}
          </g>
        )
      })}
    </g>
  )
}

function Odontograma({ servico }) {
  return (
    <svg className="odontograma" viewBox="0 0 360 380" role="img" aria-label={'Arcadas dentárias com os dentes tratados em ' + servico.nome + ' em destaque'}>
      <Arcada lado="cima" destaque={servico.cima} servico={servico.id} />
      <Arcada lado="baixo" destaque={servico.baixo} servico={servico.id} />
      <text x="180" y="186" textAnchor="middle" className="odontograma-rotulo">arcada superior</text>
      <text x="180" y="204" textAnchor="middle" className="odontograma-rotulo">arcada inferior</text>
    </svg>
  )
}

export default function Inicio() {
  const [ativo, setAtivo] = useState('clareamento')
  const servico = SERVICOS.find((item) => item.id === ativo)

  return (
    <div className="lp">
      <header className="cabecalho">
        <Logo />
        <nav className="cabecalho-usuario" aria-label="Principal">
          <a href="#servicos">Tratamentos</a>
          <a href="#sobre">Sobre nós</a>
          <a href="#contato">Contato</a>
          <Link href="/login" className="botao botao-claro">Entrar</Link>
          <Link href="/cadastro" className="botao">Criar conta</Link>
        </nav>
      </header>

      <main>
        <section className="lp-topo">
          <div className="lp-topo-texto">
            <p className="sobretitulo">Clínica odontológica</p>
            <h1>Agende sua consulta sem precisar ligar.</h1>
            <p className="lp-topo-apoio">
              Escolha o dentista, o procedimento e um horário livre. Você acompanha tudo pelo seu
              painel e cancela quando precisar.
            </p>
            <div className="destaque-botoes">
              <Link href="/cadastro" className="botao botao-grande">Agendar consulta</Link>
              <Link href="/login" className="botao botao-claro botao-grande">Já tenho conta</Link>
            </div>
          </div>

          <aside className="lp-agenda" aria-label="Exemplo de agenda do dia">
            <p className="lp-agenda-titulo">Exemplo de agenda <span>Dra. Ana Ribeiro</span></p>
            <ul>
              {AGENDA.map((item) => (
                <li key={item.hora} className={item.livre ? 'livre' : 'ocupado'}>
                  <strong>{item.hora}</strong>
                  <span>{item.livre ? 'Livre' : 'Ocupado'}</span>
                </li>
              ))}
            </ul>
            <p className="lp-agenda-nota">No site aparecem só os horários livres.</p>
          </aside>
        </section>

        <section id="servicos" className="lp-secao lp-servicos revelar">
          <div>
            <h2>O que fazemos</h2>
            <p className="lp-secao-apoio">Escolha um tratamento para ver quais dentes ele envolve.</p>
            <div className="lp-lista-servicos" role="tablist" aria-label="Tratamentos">
              {SERVICOS.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={item.id === ativo}
                  className={'lp-servico' + (item.id === ativo ? ' lp-servico-ativo' : '')}
                  onClick={() => setAtivo(item.id)}
                  onMouseEnter={() => setAtivo(item.id)}
                  onFocus={() => setAtivo(item.id)}
                >
                  <span>{item.nome}</span>
                  <small>{item.tempo}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="lp-quadro">
            <Odontograma servico={servico} />
            <div className="lp-quadro-texto" role="tabpanel">
              <h3>{servico.nome}</h3>
              <p>{servico.texto}</p>
            </div>
          </div>
        </section>

        <section className="lp-secao revelar">
          <h2>Como funciona</h2>
          <ol className="lp-passos">
            {PASSOS.map((passo) => (
              <li key={passo.titulo}>
                <h3>{passo.titulo}</h3>
                <p>{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="sobre" className="lp-secao lp-sobre revelar">
          <div>
            <h2>Sobre nós</h2>
            <p>
              A ClinicAgente é uma clínica odontológica que atende de segunda a sexta, com dentistas
              de especialidades diferentes no mesmo lugar. O atendimento é marcado com hora certa,
              para que ninguém fique esperando na recepção.
            </p>
            <p>
              Este site substitui a agenda de papel e as mensagens de WhatsApp: o cliente marca
              sozinho, o dentista vê a própria agenda e o dono acompanha tudo em um só painel.
            </p>
          </div>
          <ul className="lp-equipe" aria-label="Equipe">
            {EQUIPE.map((pessoa) => (
              <li key={pessoa.nome}>
                <span className="lp-avatar" aria-hidden="true">{pessoa.iniciais}</span>
                <div>
                  <strong>{pessoa.nome}</strong>
                  <span>{pessoa.area}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="contato" className="lp-secao revelar">
          <h2>Contato e agendamento</h2>
          <div className="grade-cartoes">
            <article className="cartao">
              <h3>Agende pelo site</h3>
              <p>Crie sua conta, escolha dentista, dia e horário.</p>
              <p><Link href="/cadastro">Criar conta e agendar</Link></p>
            </article>
            <article className="cartao">
              <h3>Horário de atendimento</h3>
              <p>Segunda a sexta, das 8h às 18h.</p>
            </article>
            <article className="cartao">
              <h3>Fale com a clínica</h3>
              <p>(12) 99999-0000 · contato@clinicagente.test</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="rodape">
        ClinicAgente · Segunda a sexta, das 8h às 18h · Trabalho acadêmico de Análise e Desenvolvimento de Sistemas
      </footer>
    </div>
  )
}
