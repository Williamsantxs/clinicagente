// Cria a conexao com o Supabase (banco de dados + login).
// Todas as paginas importam este mesmo "supabase" para ler e gravar dados.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)
