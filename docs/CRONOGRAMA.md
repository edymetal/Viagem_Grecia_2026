# Cronograma corrigido — Atenas, 20 a 23/11/2026

A tabela completa da correção enviada pelo viajante é a referência desta revisão. A introdução em prosa repete parte das informações e termina incompleta; não gerou etapas duplicadas. Não foram consultadas novas disponibilidades nem alterados os preços fornecidos. Compras, hotel e guias continuam pendentes.

## Organização dos dados

- `src/data/itinerary-activities.json`: 89 etapas, cada uma com horário original, descrição, custo quando informado, fuso e natureza do horário. Distribuição: sexta 19, sábado 24, domingo 27, segunda 19.
- `src/data/itinerary.ts`: detalhes complementares já fornecidos, locais, links, funcionamento, transportes, preços, hotel, voos, alternativas e checklist.
- `src/data/itinerary-previous.json`: somente o plano público da revisão anterior, usado na migração. Não é um backup do navegador e não contém documentos ou códigos pessoais.
- `src/lib/itinerary.ts`: migração de revisão conhecida e incorporação inicial para estados sem roteiro.
- `src/data/initial.ts`: planejamento corrigido para novas instalações.

Os IDs anteriores das etapas correspondentes foram mantidos. Foram inseridas 29 etapas de margem, acesso, preparação e caminhada. O bloco antigo de tempo adicional no museu tornou-se a saída de 10 minutos prevista na correção. Fotos, favoritos, conclusão e notas continuam associados aos mesmos IDs. A caminhada de sábado vai diretamente do hotel à Biblioteca de Adriano; a foto de Monastiraki foi retirada dessa etapa para não indicar uma parada fora do roteiro. A visita à biblioteca mantém a fotografia do local.

## Mudanças principais

- **20/11:** aguardar o trem 06h45–07h04 e estar próximo ao portão a partir de 11h45. Passe 19h20–19h35; metrô 19h35–20h45; caminhada 20h45–20h55; check-in 20h55–21h15. Restaurante 21h15–21h25, jantar 21h25–22h10, retorno 22h10–22h20.
- **21/11:** café 07h30–08h10; preparo até 08h25. Hotel → biblioteca 08h25–08h45, acesso até 09h, visita 09h–09h35 e saída até 09h45. Kotsanas 10h25–11h25, saída até 11h35. Anafiotika 13h05–13h25. Caminhada ao guia 13h50–14h10 e apresentação 14h10–14h30. Guia provisório 14h30–16h30; retorno ao hotel até 17h10. Jantar 19h10–20h20, retorno até 20h30.
- **22/11:** Ágora 08h15–09h45, saída até 09h55; caminhada ao Parlamento até 10h30. Guarda 11h–11h30. Jardim/Zappeion são passagem breve até Zeus, 11h30–12h05. Zeus 12h15–12h50, saída até 13h. Arco 13h05–13h15. Almoço 13h25–14h05; caminhada ao encontro até 14h15 e apresentação até 14h30. Museu provisório 14h30–16h30; finalizar e sair 16h30–16h40; hotel 16h40–16h50. A escavação depende de coordenação com o operador: não há visita separada garantida depois do tour. Bagagem a partir de 20h30.
- **23/11:** conferir quarto/documentos 07h40–08h, check-out 08h–08h15; estação até 08h30. Janela do metrô 08h30–10h, caminhada ao terminal 10h–10h15 e procedimentos 10h15–11h45. Lanche em Palermo 19h15–19h55, estação até 20h10 e plataforma até 20h26. Trens 20h26–21h17 e 21h35–22h59 mantidos.

## Fusos e pendências

Horários italianos: `Europe/Rome`. Horários gregos: `Europe/Athens`, uma hora à frente da Itália nas datas fornecidas. Não foram inventados os horários intermediários das conexões em Roma; somente as esperas consultadas de 1h45 e 3h20. Os horários de trens e voos precisam ser reconferidos antes de comprar. As janelas do metrô incluem espera e troca; 19h35 e 08h30 não são partidas confirmadas.

Os dois guias das 14h30 continuam propostos e dependem do operador, inclusive duração, antecedência e endereço de encontro. Não há endereço presumido para guias ou restaurantes. Os percursos casa → estação e estação → casa não estão definidos; 22h59 é chegada à estação, não em casa. Os horários de funcionamento anteriores são mantidos como referência identificada para reconferência. O roteiro padrão corrigido não tem sobreposições detectadas; edições locais podem gerar avisos.

## Financeiro

As 11 previsões continuam: voos €206,01; trens €14,40 de ida e €14,40 de volta; passe €20; seis ingressos €107; alimentação global €80–120. Subtotal sem alimentação, hotel e guias: €361,81. Com alimentação: €441,81–481,81, sem hotel e dois guias. Não foram criadas reservas, despesas realizadas ou valores presumidos para hotel/guias. Os preços individuais das refeições omitidos na correção não foram inventados; o jantar de sexta preserva a estimativa expressa de €12–20.

Etapas de acesso, saída e caminhadas não geram despesas extras. As refeições não duplicam a previsão global. Alternativas do planejamento anterior continuam fora do roteiro e do orçamento até o viajante escolhê-las; precisam ser compatibilizadas com os novos horários.

## Atualização de instalações existentes

Ao carregar ou restaurar a revisão `cronograma-2026-11-05`, a aplicação grava automaticamente a correção `cronograma-2026-11-05-correcao-2` no IndexedDB. Compara o registro local com o original público e atualiza somente campos ainda inalterados. Edições pessoais, ordem, exclusões, fotos, favoritos, visitas concluídas, despesas, orçamento, documentos e reservas são preservados. Se uma combinação com uma edição pessoal ficaria inválida, mantém esse registro local integralmente. As 29 novas etapas são inseridas ao lado das etapas correspondentes. A correção não se repete e não recria as despesas.

Estados sem revisão ou de revisão desconhecida não são substituídos automaticamente. Neles, o botão **Incorporar cronograma** continua oferecendo a incorporação aditiva; despesas são opcionais se já houver gastos. O backup mantém o formato v1, e a restauração permanece uma substituição explícita, seguida da migração quando o backup pertence à revisão antiga conhecida.

Nenhum documento pessoal, reserva privada ou endereço residencial foi incorporado ao código. A captura do hotel continua fora do repositório. Antes de futuras alterações, execute TypeScript, testes unitários, build e testes de navegador/offline no subdiretório do GitHub Pages.
