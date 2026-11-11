'use client'
// Barra do topo dos paineis: mostra quem esta logado e o botao de sair.
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Logo from './Logo'
import { iniciais } from './Faixa'

const NOMES_PAPEL = { admin: 'Administrador', dentista: 'Dentista', cliente: 'Cliente' }

export default function Cabecalho({ perfil }) {
  const router = useRouter()

  async function sair() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="cabecalho">
      <Logo />
      <div className="cabecalho-usuario">
        <span className="avatar" aria-hidden="true">{iniciais(perfil.nome)}</span>
        <div>
          <strong>{perfil.nome}</strong>
          <span className={'etiqueta papel-' + perfil.papel}>{NOMES_PAPEL[perfil.papel]}</span>
        </div>
        <button className="botao botao-claro" onClick={sair}>Sair</button>
      </div>
    </header>
  )
}
