// Pagina inicial (publica): apresenta a clinica e leva para login ou cadastro.
import Link from 'next/link'
import Logo from '../components/Logo'

const SERVICOS = [
  { nome: 'Avaliação inicial', texto: 'Primeira consulta para entender o que você precisa.' },
  { nome: 'Limpeza', texto: 'Profilaxia completa para manter a saúde da boca.' },
  { nome: 'Ortodontia', texto: 'Aparelhos e manutenção com acompanhamento mensal.' },
  { nome: 'Clareamento', texto: 'Tratamento estético feito no consultório.' },
  { nome: 'Restauração', texto: 'Recuperação de dentes com cárie ou fratura.' },
  { nome: 'Implantes', texto: 'Reposição de dentes com planejamento individual.' },
]

export default function Inicio() {
  return (
    <>
      <header className="cabecalho">
        <Logo />
        <nav className="cabecalho-usuario">
          <a href="#sobre">Sobre nós</a>
          <a href="#contato">Contato</a>
          <Link href="/login" className="botao botao-claro">Entrar</Link>
          <Link href="/cadastro" className="botao">Criar conta</Link>
        </nav>
      </header>

      <main>
        <section className="destaque">
          <p className="sobretitulo">Clínica odontológica</p>
          <h1>Agende sua consulta sem precisar ligar.</h1>
          <p className="destaque-texto">
            Escolha o dentista, o procedimento e o horário. Você acompanha tudo pelo seu painel
            e pode cancelar quando precisar.
          </p>
          <div className="destaque-botoes">
            <Link href="/cadastro" className="botao botao-grande">Agendar consulta</Link>
            <Link href="/login" className="botao botao-claro botao-grande">Já tenho conta</Link>
          </div>
        </section>

        <section className="conteudo">
          <h2>O que fazemos</h2>
          <div className="grade-cartoes">
            {SERVICOS.map((servico) => (
              <article key={servico.nome} className="cartao">
                <h3>{servico.nome}</h3>
                <p>{servico.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="sobre" className="conteudo">
          <h2>Sobre nós</h2>
          <div className="painel">
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
        </section>

        <section id="contato" className="conteudo">
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
    </>
  )
}
