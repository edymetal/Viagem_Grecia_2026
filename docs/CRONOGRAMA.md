# Como incorporar o cronograma definitivo

A interface não contém horários, tarifas, reservas nem atrações de exemplo. O ponto de entrada dos dados públicos é `src/data/initial.ts`; os modelos e limites estão em `src/data/schema.ts`. `initialState()` deve continuar produzindo um objeto aceito por `stateSchema`.

## Estrutura

- `days`: as quatro datas ISO de 20 a 23/11/2026, com anotações por dia.
- `activities`: a ordem no array é a ordem exibida. Cada atividade tem ID estável, dia, início/fim `HH:mm` (Atenas), nome, descrição, endereço, preço e sua natureza, duração, funcionamento, links, notas, transporte, obrigatoriedade, confirmação e conclusão.
- `transport`: meio, origem/destino, estação, linhas, minutos, preço, natureza e observações. Dados ausentes permanecem vazios ou `null`.
- `photoDocumentId`: vínculo opcional com uma imagem inserida no dispositivo, nunca um arquivo pessoal publicado.
- `expenses` e `budget`: lançamentos financeiros independentes. Preços de atividades não criam despesas automaticamente, para evitar contagem dupla.
- `hotel`: nome, endereço, entrada/saída com fuso explícito, site e observações.
- `flights`: origem, destino, saída/chegada (preservar data e fuso local fornecidos), natureza e notas. Datas de voos são texto de referência, não alimentam a contagem regressiva.
- `reservations`: título, referência, notas e vínculo com documento local. Códigos pessoais devem entrar somente pelo app ou backup local.
- `useful`: telefones, emergências, transporte, segurança, ingressos, horários, notas e frases PT/IT/EL.
- `checklist`: itens com ID, título e conclusão.

## Procedimento para a próxima etapa

1. Analisar o cronograma fornecido, separar dados confirmados de sugestões/estimativas e apontar ausências.
2. Preservar valores e horários. Não consultar ou completar atrações, tarifas e rotas sem solicitação.
3. Atribuir IDs estáveis e preencher o módulo de dados públicos. Manter reservas, referências, PDFs, QR e informações privadas fora do código. Inserir esses dados somente na instalação local.
4. Rodar `stateSchema.parse(dados)` e `conflicts(dados.activities)` para revisar sobreposições. Considerar também a viabilidade dos deslocamentos apenas quando houver duração fornecida. O validador não deduz tempo de viagem.
5. O app aceita atividades com horários vazios. Início/fim de uma atividade são do mesmo dia; atividades que cruzam meia-noite precisam ser separadas por data. Não converte automaticamente horários de voos italianos em horários gregos.
6. Atualizar testes e verificar cache offline em produção.

## Instalações existentes

Dados iniciais só são usados em um navegador ainda sem estado salvo. Atualizar o código **não sobrescreve** as edições locais do viajante. Para incorporar um cronograma a uma instalação existente, use os formulários ou um backup v1 completo, revisado e validado, seguido da confirmação de restauração. Faça uma exportação antes: a importação substitui o estado, não mescla automaticamente. O backup pode carregar dados privados sem publicá-los no repositório.

O fuso para dia atual, próxima atividade, calendário e contagem de dias é sempre `Europe/Athens`. A contagem é em dias de calendário porque o horário de partida ainda não foi informado.
