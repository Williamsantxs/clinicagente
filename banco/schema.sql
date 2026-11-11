-- =====================================================================
-- ClinicAgente - estrutura do banco de dados (PostgreSQL / Supabase)
-- 3 tabelas: perfis, servicos, consultas
-- 3 papeis de usuario: admin (dono), dentista, cliente
-- =====================================================================

-- ---------- TABELAS ----------

-- Um perfil para cada usuario que faz login (ligado ao auth.users do Supabase)
create table public.perfis (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text not null,
  email         text not null,
  telefone      text,
  papel         text not null default 'cliente'
                check (papel in ('admin', 'dentista', 'cliente')),
  especialidade text,                       -- usado so por dentistas
  criado_em     timestamptz not null default now()
);

-- Procedimentos que a clinica oferece
create table public.servicos (
  id          bigint generated always as identity primary key,
  nome        text not null,
  duracao_min integer not null default 30 check (duracao_min > 0),
  preco       numeric(10, 2) not null default 0 check (preco >= 0),
  ativo       boolean not null default true
);

-- Agendamentos: liga um cliente, um dentista e um servico
create table public.consultas (
  id          bigint generated always as identity primary key,
  cliente_id  uuid not null references public.perfis (id) on delete cascade,
  dentista_id uuid not null references public.perfis (id) on delete cascade,
  servico_id  bigint not null references public.servicos (id),
  data_hora   timestamptz not null,
  status      text not null default 'agendada'
              check (status in ('agendada', 'confirmada', 'concluida', 'cancelada')),
  observacoes text,                         -- anotacoes do dentista
  criado_em   timestamptz not null default now()
);

create index consultas_cliente_idx  on public.consultas (cliente_id);
create index consultas_dentista_idx on public.consultas (dentista_id);
create index consultas_servico_idx  on public.consultas (servico_id);

-- Impede dois agendamentos ativos no mesmo horario para o mesmo dentista
create unique index consultas_horario_unico
  on public.consultas (dentista_id, data_hora)
  where status <> 'cancelada';

-- ---------- FUNCOES AUXILIARES ----------

-- Schema "private" nao e exposto pela API: so o banco consegue chamar
create schema if not exists private;

-- Devolve o papel do usuario logado (usada nas regras de acesso)
create or replace function private.meu_papel()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select papel from public.perfis where id = (select auth.uid());
$$;

grant usage on schema private to authenticated;
revoke execute on function private.meu_papel() from public, anon;
grant execute on function private.meu_papel() to authenticated;

-- Quando alguem se cadastra, cria automaticamente o perfil como "cliente"
create or replace function private.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome, email, telefone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'telefone'
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function private.criar_perfil();

-- So o admin pode mudar o papel de alguem (ninguem se promove sozinho)
create or replace function private.proteger_papel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.papel is distinct from old.papel
     and (select auth.uid()) is not null
     and coalesce(private.meu_papel(), '') <> 'admin' then
    raise exception 'Apenas o administrador pode alterar o papel de um usuario';
  end if;
  return new;
end;
$$;

create trigger antes_de_alterar_perfil
  before update on public.perfis
  for each row execute function private.proteger_papel();

-- Cliente so pode mudar o status da propria consulta (para cancelar);
-- dentista so pode mudar status e observacoes
create or replace function private.proteger_consulta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  papel_atual text := private.meu_papel();
begin
  if (select auth.uid()) is null or papel_atual = 'admin' then
    return new;
  end if;

  if new.cliente_id <> old.cliente_id or new.dentista_id <> old.dentista_id
     or new.servico_id <> old.servico_id or new.data_hora <> old.data_hora then
    raise exception 'Voce nao pode alterar os dados desta consulta';
  end if;

  if papel_atual = 'cliente' then
    if new.observacoes is distinct from old.observacoes then
      raise exception 'Cliente nao pode alterar observacoes';
    end if;
    if new.status <> old.status and new.status <> 'cancelada' then
      raise exception 'Cliente so pode cancelar a consulta';
    end if;
  end if;
  return new;
end;
$$;

create trigger antes_de_alterar_consulta
  before update on public.consultas
  for each row execute function private.proteger_consulta();

-- Horarios ja ocupados de um dentista em um dia (sem revelar quem e o paciente)
create or replace function public.horarios_ocupados(p_dentista uuid, p_dia date)
returns setof timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select c.data_hora
  from public.consultas c
  where (select auth.uid()) is not null
    and c.dentista_id = p_dentista
    and c.status <> 'cancelada'
    and (c.data_hora at time zone 'America/Sao_Paulo')::date = p_dia;
$$;

revoke execute on function public.horarios_ocupados(uuid, date) from public, anon;
grant execute on function public.horarios_ocupados(uuid, date) to authenticated;

-- ---------- PERMISSOES E REGRAS DE ACESSO (RLS) ----------

grant select, update on public.perfis to authenticated;
grant select, insert, update, delete on public.servicos to authenticated;
grant select, insert, update, delete on public.consultas to authenticated;

alter table public.perfis    enable row level security;
alter table public.servicos  enable row level security;
alter table public.consultas enable row level security;

-- PERFIS: cada um ve o proprio; todos veem os dentistas;
-- admin e dentista veem todos (precisam do nome dos pacientes)
create policy "ver perfis" on public.perfis
  for select to authenticated
  using (
    id = (select auth.uid())
    or papel = 'dentista'
    or (select private.meu_papel()) in ('admin', 'dentista')
  );

create policy "alterar perfis" on public.perfis
  for update to authenticated
  using (id = (select auth.uid()) or (select private.meu_papel()) = 'admin')
  with check (id = (select auth.uid()) or (select private.meu_papel()) = 'admin');

-- SERVICOS: todo usuario logado ve; so o admin cadastra, altera e apaga
create policy "ver servicos" on public.servicos
  for select to authenticated
  using (true);

create policy "admin cria servicos" on public.servicos
  for insert to authenticated
  with check ((select private.meu_papel()) = 'admin');

create policy "admin altera servicos" on public.servicos
  for update to authenticated
  using ((select private.meu_papel()) = 'admin')
  with check ((select private.meu_papel()) = 'admin');

create policy "admin apaga servicos" on public.servicos
  for delete to authenticated
  using ((select private.meu_papel()) = 'admin');

-- CONSULTAS: cliente ve as suas, dentista ve as dele, admin ve todas
create policy "ver consultas" on public.consultas
  for select to authenticated
  using (
    cliente_id = (select auth.uid())
    or dentista_id = (select auth.uid())
    or (select private.meu_papel()) = 'admin'
  );

create policy "criar consultas" on public.consultas
  for insert to authenticated
  with check (
    (cliente_id = (select auth.uid()) and (select private.meu_papel()) = 'cliente')
    or (select private.meu_papel()) = 'admin'
  );

create policy "alterar consultas" on public.consultas
  for update to authenticated
  using (
    cliente_id = (select auth.uid())
    or dentista_id = (select auth.uid())
    or (select private.meu_papel()) = 'admin'
  )
  with check (
    cliente_id = (select auth.uid())
    or dentista_id = (select auth.uid())
    or (select private.meu_papel()) = 'admin'
  );

create policy "admin apaga consultas" on public.consultas
  for delete to authenticated
  using ((select private.meu_papel()) = 'admin');
