# Cronograma recebido — Atenas, 20 a 23/11/2026

O planejamento fornecido foi incorporado sem reconsultar preços, funcionamento, disponibilidade ou sites externos. O texto informa que nenhuma compra ou reserva foi realizada. A captura da Booking.com mostra um anúncio, sem comprovante de reserva ou total final; o arquivo contém dados de conta e permanece fora do repositório.

## Dados e organização

- `src/data/itinerary-activities.json`: transcrição dos 60 blocos das tabelas, preservando títulos, horários, detalhes e custos originais: 15 na sexta, 14 no sábado, 17 no domingo e 14 na segunda.
- `src/data/itinerary.ts`: identificadores estáveis, fusos, locais nomeados, endereços fornecidos, links, funcionamento, notas, transporte, preços, voos, hotel, alternativas e checklist. Não contém fotos, códigos de reserva ou dados da conta do viajante.
- `src/data/initial.ts`: fornece o planejamento a uma instalação sem estado salvo.
- `src/data/factories.ts`: cria atividades novas e estados vazios, sem dados demonstrativos.
- `src/data/schema.ts`: contrato validado, incluindo campos opcionais compatíveis com os backups v1 anteriores.
- `src/lib/itinerary.ts`: incorporação aditiva em uma instalação anterior, sem substituir os dados locais.

## Confirmações e fusos

Os blocos do roteiro são `Planejada`; o tempo adicional opcional no museu é `Sugestão`. Os dois tours das 14h30 às 16h30 e seus encontros são `Proposto`. Trens e voos têm horários `Consultado`, o que não significa comprado. Nenhuma atividade foi marcada como concluída e nenhum gasto como pago ou realizado.

Horários italianos usam `Europe/Rome`; atividades na Grécia usam `Europe/Athens`. As conexões em Roma não receberam horários intermediários inventados: sua duração fornecida aparece nas notas. A linha do tempo preserva horários locais e exibe o fuso em cada bloco. A próxima atividade e os conflitos usam instantes equivalentes calculados pelas regras IANA, independentemente do fuso do dispositivo. A contagem de dias e o destaque do dia continuam em Atenas.

Locais podem ser nomes pesquisáveis (por exemplo, Biblioteca de Adriano), sem apresentar um endereço de rua não fornecido. Ponto de encontro dos guias permanece em branco. As faixas de caminhada são preservadas como mínimo/máximo ou nas observações, sem escolher uma média.

## Pontos a revisar

1. Sexta: o deslocamento termina aproximadamente às 20h40 e o check-in tem janela estimada de 20h30–21h. Os horários foram mantidos e a sobreposição aparece no aviso.
2. Domingo: o tour proposto termina às 16h30, exatamente na última entrada informada para a escavação. O trecho adicional 16h30–17h não garante acesso; verificar visita antes do guia ou reorganizar conforme a reserva.
3. Os horários e preços dos dois guias, sobretudo o do museu no domingo, ainda precisam ser confirmados. Reservar **somente guia**, depois os ingressos oficiais compatíveis.
4. Hotel escolhido por três noites, ainda sem preço final, taxas, café da manhã ou cancelamento confirmados. Destaque de café no anúncio não comprova inclusão na tarifa.

## Financeiro

Foram cadastradas 11 despesas **previstas**, com datas de referência no roteiro, não datas de compras: voos de ida e volta €206,01; trens de ida €14,40 e volta €14,40; passe €20; seis ingressos totalizando €107; alimentação global €80–120.

Subtotal sem hotel, alimentação e guias: **€361,81**. Com alimentação: **€441,81–481,81**, ainda sem hotel e dois guias. O orçamento total permanece indefinido. Hotel por €240 e a faixa resultante €681,81–721,81 mais guias são **simulação**, não lançamento real. Não foram criadas despesas com valores desconhecidos ou valor zero para hotel/guias.

As refeições individuais não são somadas novamente à previsão global; os trajetos cobertos pelo passe e o tempo adicional no museu também não geram cobranças duplicadas. Ao registrar refeições/gastos realizados, reduza ou substitua a previsão correspondente. Despesas pagas ou realizadas exigem valor exato, sem faixa.

Alternativas ficam fora do roteiro principal e do orçamento até serem escolhidas. Kotsanas completo custa €12 **em substituição** ao de €7, diferença de €5. A Ágora Romana custa €10 e precisa substituir um bloco. Filopapo/Pnyx não recebeu preço ou duração inventados. Estádio Panatenaico continua removido.

## Instalações já existentes

Ao abrir uma instalação anterior, o aviso **Incorporar cronograma** permite acrescentar o plano uma vez. São preservados arquivos, reservas, orçamento, hotel já informado, notas/campos preenchidos e atividades com o mesmo ID ou nome/dia. Se já houver despesas locais, a inclusão das 11 previsões vem desmarcada para evitar duplicidade; o usuário pode escolher. Nenhuma reserva privada é criada ou publicada.

Exporte um backup antes de incorporar e revise a ordem se já houver atividades próprias. Reabrir o app não duplica nem restaura itens do plano excluídos após a incorporação. Restaurar um backup continua sendo uma operação separada de substituição integral. As novas informações de fuso, faixas e alternativas são incluídas no backup v1; campos antigos ausentes continuam aceitos.

## Próximas atualizações

Edite localmente compras efetivas, confirmações, referências e documentos. Ajustes públicos no planejamento devem manter IDs estáveis e preservar os horários/valores fornecidos. Nunca inclua comprovantes, QR, dados de conta ou códigos privados no módulo público. Depois de alterações, execute TypeScript, testes, build e testes offline em subdiretório.
