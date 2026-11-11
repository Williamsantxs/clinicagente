'use client'
// Hook usado pelos 3 paineis. Ele:
// 1. confere se existe alguem logado (se nao, manda para /login)
// 2. busca o perfil dessa pessoa na tabela "perfis"
// 3. se o papel dela nao for o exigido pela pagina, manda para o painel certo
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

export function usePerfil(papelExigido) {
  const [perfil, setPerfil] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!data) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      if (data.papel !== papelExigido) {
        router.replace('/' + data.papel)
        return
      }

      setPerfil(data)
    }
    carregar()
  }, [papelExigido, router])

  return perfil
}
