# Roteiro para a apresentação

Leia os arquivos na ordem abaixo antes de apresentar. São poucos e todos têm comentários.

## 1. O que dizer em uma frase

"É um sistema de agendamento para clínica odontológica com três perfis de acesso.
A interface é em Next.js e o banco e o login ficam no Supabase, que é um PostgreSQL na nuvem."

## 2. Ordem da demonstração (uns 5 minutos)

1. Página inicial, depois "Entrar".
2. Clicar em **Cliente** nos usuários de exemplo e entrar. Agendar uma consulta:
   mostrar que os horários ocupados do dentista somem da lista.
3. Sair. Entrar como **Dentista**. Mostrar que a consulta recém-criada apareceu na
   agenda dele (se foi marcada com a Dra. Ana). Confirmar, escrever uma observação e concluir.
4. Sair. Entrar como **Dono (admin)**. Mostrar o Resumo, a aba Consultas (todas, de
   todos os dentistas), a aba Usuários (mudar papel) e a aba Serviços (cadastrar um).
5. Voltar como Cliente e mostrar que o status e a observação do dentista aparecem para ele.

## 3. Ordem de leitura do código

1. `lib/supabase.js` (8 linhas): cria a conexão com o banco.
2. `app/login/page.js`: `signInWithPassword` confere e-mail e senha; depois lê o `papel`
   na tabela `perfis` e redireciona para `/admin`, `/dentista` ou `/cliente`.
3. `lib/usePerfil.js`: roda no começo de cada painel. Sem login, manda para `/login`.
   Com papel diferente do exigido, manda para o painel certo.
4. `app/cliente/page.js`: o mais completo. Tem leitura (`select`), gravação (`insert`),
   alteração (`update`) e a chamada `rpc('horarios_ocupados')`.
5. `banco/schema.sql`: tabelas, trigger que cria o perfil no cadastro e as regras de acesso.

## 4. Perguntas prováveis e respostas

**Por que Next.js?**
Cada pasta dentro de `app/` vira uma rota do site (`app/login/page.js` é `/login`),
e as telas são componentes React, então dá para reaproveitar peças como o cabeçalho.

**O que é `'use client'` no topo dos arquivos?**
Avisa o Next.js que aquela página roda no navegador, porque usa estado (`useState`)
e eventos de clique. A página inicial não tem, porque é só conteúdo fixo.

**O que são `useState` e `useEffect`?**
`useState` guarda um valor que, quando muda, redesenha a tela (a lista de consultas, o que
foi digitado no formulário). `useEffect` executa algo quando a página abre ou quando um
valor muda (buscar as consultas no banco, buscar horários ocupados ao trocar o dia).

**Onde está o back-end?**
No Supabase. Ele gera uma API em cima do PostgreSQL, e o site conversa com essa API pela
biblioteca `supabase-js`. As regras de negócio que precisam de proteção ficam no banco.

**Um cliente consegue ver a consulta de outro mexendo no navegador?**
Não. A regra "ver consultas" no `schema.sql` só devolve linhas em que o usuário logado é
o cliente, o dentista ou um admin. Isso é Row Level Security, e vale mesmo se alguém
chamar a API direto, sem passar pelo site.

**Como as senhas são guardadas?**
O Supabase Auth guarda só o hash (bcrypt). O sistema nunca lê nem grava a senha em texto.

**Como evita dois pacientes no mesmo horário?**
Índice único `consultas_horario_unico` em (dentista, data e hora), ignorando as canceladas.
Se dois tentarem ao mesmo tempo, o banco aceita um e devolve o erro 23505 para o outro,
e a tela mostra "Esse horário acabou de ser ocupado".

**Como um dentista é cadastrado?**
Ele cria a conta como qualquer pessoa (nasce como cliente) e o dono muda o papel na aba
Usuários. Um trigger impede qualquer outra pessoa de mudar papéis.

**A chave do Supabase está no código. Isso não é falha?**
É a chave pública (publishable), feita para ficar no navegador. Ela identifica o projeto,
não dá permissão. A permissão vem do login mais as regras RLS.

## 5. Limitações (diga antes que perguntem)

- Horários fixos de uma hora, sem considerar a duração de cada procedimento.
- Não envia e-mail nem WhatsApp de lembrete.
- O dono não cria a conta do dentista direto pelo painel; ele promove uma conta existente.
- Sem pagamento online; o valor concluído é só um total no resumo.
