-- ============================================================
-- JOSÉ+ — dados de exemplo (opcional, rodar depois do schema.sql)
-- ============================================================

insert into avisos (texto, data) values
  ('Amanhã não haverá aula por conta da manutenção elétrica.', current_date),
  ('Reunião de pais dia 25, às 19h no auditório.', current_date);

insert into eventos (titulo, descricao, data) values
  ('Passeio ao museu de ciências', 'Saída às 8h, retorno às 17h.', current_date + 6),
  ('Festa junina da escola', null, current_date + 18);

insert into provas (materia, conteudo, data) values
  ('Matemática', 'Frações e números decimais', current_date + 8),
  ('Ciências', 'Sistema solar', current_date + 12);

insert into trabalhos (titulo, materia, entrega) values
  ('Redação sobre meio ambiente', 'Português', current_date + 10);

insert into merenda (data, itens) values
  (current_date, array['Arroz', 'Feijão', 'Frango grelhado', 'Salada de alface e tomate', 'Suco de laranja']);

insert into caixa_lancamentos (tipo, descricao, valor, categoria, data) values
  ('receita', 'Rifa de páscoa', 500, 'rifa', current_date),
  ('receita', 'Vaquinha coletiva', 400, 'vaquinha', current_date),
  ('despesa', 'Decoração da sala', 120, 'geral', current_date);

insert into metas (nome, tipo, meta) values
  ('Meta da formatura', 'formatura', 8000),
  ('Rifa de páscoa', 'rifa', 600),
  ('Vaquinha coletiva', 'vaquinha', 1000);
