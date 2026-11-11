'use client'
// Cadastro de novos clientes. Toda conta criada aqui nasce com o papel "cliente".
// Quem transforma alguem em dentista ou admin e o dono, pelo painel dele.
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/Logo'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function cadastrar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)

    // Cria o usuario no Supabase Auth. O nome e o telefone vao junto e um
    // "trigger" no banco cria a linha dele na tabela "perfis" automaticamente.
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, telefone } },
    })

    setCarregando(false)

    if (error) {
      setErro('Não foi possível criar a conta: ' + error.message)
      return
    }

    if (data.session) {
      // Conta criada e ja logada
      router.replace('/cliente')
    } else {
      // O Supabase esta pedindo confirmacao por e-mail
      setMensagem('Conta criada. Confirme pelo link enviado ao seu e-mail e depois faça login.')
    }
  }

  return (
    <main className="tela-acesso">
      <div className="caixa-acesso">
        <Logo />
        <h1>Criar conta</h1>

        <form onSubmit={cadastrar} className="formulario">
          <label>
            Nome completo
            <input value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" />
          </label>
          <label>
            Telefone
            <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(12) 99999-9999" autoComplete="tel" />
          </label>
          <label>
            E-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Senha (mínimo 6 caracteres)
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} autoComplete="new-password" />
          </label>
          {erro && <p className="aviso aviso-erro">{erro}</p>}
          {mensagem && <p className="aviso aviso-ok">{mensagem}</p>}
          <button className="botao botao-grande" disabled={carregando}>
            {carregando ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="texto-menor">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </div>
    </main>
  )
}
