# ClinicAgente

Sistema de agendamento para uma clínica odontológica, com três tipos de usuário:
dono (admin), dentista e cliente.

Feito com **Next.js** (páginas e interface, em JavaScript) e **Supabase**
(banco de dados PostgreSQL e login).

## Usuários de exemplo

A senha de todos é `clinic123`.

| Papel         | E-mail                        | O que pode fazer |
|---------------|-------------------------------|------------------|
| Dono (admin)  | admin@clinicagente.test       | Ver todas as consultas, mudar status, apagar, definir quem é dentista, cadastrar serviços e preços |
| Dentista      | dentista@clinicagente.test    | Ver só a própria agenda, confirmar, concluir ou cancelar consultas, anotar observações |
| Dentista 2    | dentista2@clinicagente.test   | Igual ao anterior, com outra agenda |
| Cliente       | cliente@clinicagente.test     | Agendar consulta, ver só as próprias consultas, cancelar |
| Cliente 2     | cliente2@clinicagente.test    | Igual ao anterior |

## Como rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Estrutura das pastas

```
app/
  page.js            página inicial (pública)
  login/page.js      login e redirecionamento por papel
  cadastro/page.js   criação de conta de cliente
  admin/page.js      painel do dono
  dentista/page.js   painel do dentista
  cliente/page.js    painel do cliente
  globals.css        todos os estilos
components/          Cabecalho, Logo e Status (peças reaproveitadas)
lib/
  supabase.js        conexão com o Supabase
  usePerfil.js       confere quem está logado e protege os painéis
  formatos.js        datas, preços e horários de atendimento
banco/schema.sql     tabelas, funções e regras de acesso do banco
.env                 endereço e chave pública do Supabase
```

## Banco de dados

Três tabelas:

- **perfis**: um registro por usuário, com nome, telefone e `papel` (admin, dentista ou cliente).
- **servicos**: procedimentos, duração e preço.
- **consultas**: liga cliente, dentista e serviço a uma data e hora, com status
  (agendada, confirmada, concluída, cancelada) e observações.

Relações: uma consulta pertence a um cliente, a um dentista e a um serviço
(chaves estrangeiras `cliente_id`, `dentista_id`, `servico_id`).

## Como a segurança funciona

A separação entre os papéis não é feita só na tela. Ela está no banco, com
**Row Level Security (RLS)**: cada tabela tem regras que dizem quais linhas o
usuário logado pode ler ou alterar.

- Cliente: lê e cria apenas consultas em que ele é o `cliente_id`; só consegue cancelar.
- Dentista: lê e altera apenas consultas em que ele é o `dentista_id`; só muda status e observações.
- Admin: lê e altera tudo.
- Ninguém muda o próprio papel: um trigger bloqueia, só o admin pode.
- Dois agendamentos no mesmo horário para o mesmo dentista são recusados por um índice único.

Por isso a chave do arquivo `.env` pode ficar no navegador: ela só identifica o
projeto. O que cada pessoa enxerga depende do login e das regras do banco.
