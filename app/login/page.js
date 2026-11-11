'use client'
// Tela de login. Depois de entrar, descobre o papel do usuario
// (admin, dentista ou cliente) e manda para o painel correspondente.
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/Logo'

// Usuarios de exemplo pedidos pelo professor (senha igual para todos)
const EXEMPLOS = [
  { rotulo: 'Dono (admin)', email: 'admin@clinicagente.test' },
  { rotulo: 'Dentista', email: 'dentista@clinicagente.test' },
  { rotulo: 'Cliente', email: 'cliente@clinicagente.test' },
]
const SENHA_EXEMPLO = 'clinic123'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function entrar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)

    // 1. Confere e-mail e senha no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    // 2. Busca o papel do usuario na tabela "perfis"
    const { data: perfil } = await supabase
      .from('perfis')
      .select('papel')
      .eq('id', data.user.id)
      .single()

    // 3. Redireciona: /admin, /dentista ou /cliente
    router.replace('/' + (perfil ? perfil.papel : 'cliente'))
  }

  function preencher(exemplo) {
    setEmail(exemplo.email)
    setSenha(SENHA_EXEMPLO)
  }

  return (
    <main className="tela-acesso">
      <div className="caixa-acesso">
        <Logo />
        <h1>Entrar</h1>

        <form onSubmit={entrar} className="formulario">
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Senha
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
          </label>
          {erro && <p className="aviso aviso-erro">{erro}</p>}
          <button className="botao botao-grande" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="texto-menor">
          Ainda não tem conta? <Link href="/cadastro">Criar conta de cliente</Link>
        </p>

        <div className="exemplos">
          <p><strong>Usuários de exemplo</strong> (clique para preencher)</p>
          <div className="exemplos-botoes">
            {EXEMPLOS.map((exemplo) => (
              <button key={exemplo.email} type="button" className="botao botao-claro" onClick={() => preencher(exemplo)}>
                {exemplo.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
