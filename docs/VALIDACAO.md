# Validação do aplicativo e cronograma

Verificação local em 05/11/2026, com Node 22.23.4 e Chromium do Playwright. O cronograma fornecido foi inserido com 60 blocos e quatro alternativas. A captura da Booking.com permanece fora do código. Nenhum teste usou documentos pessoais ou aparelhos físicos.

| Verificação                     | Resultado                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run check`                 | TypeScript sem erros                                                                                     |
| `npm test`                      | 19 testes aprovados, em 3 arquivos                                                                       |
| `npm run build`                 | Build aprovado, manifest e service worker gerados                                                        |
| `npm run test:e2e`              | 9 testes aprovados em Chromium com emulação Android                                                      |
| Subdiretório padrão             | `/Viagem_Grecia_2026/` aprovado, inclusive recarga offline                                               |
| Nome alternativo do repositório | Build e 9 testes de navegador aprovados com `/teste-pages/`                                              |
| Layout                          | 11 telas verificadas sem rolagem horizontal em 320, 390 e 1440 px; capturas clara e escura inspecionadas |
| Auditoria de produção           | `npm audit --omit=dev`: nenhuma vulnerabilidade                                                          |
| Auditoria das ferramentas       | 4 avisos baixos transitivos de `deepmerge` via Workbox; detalhes no README                               |

## Cobertura funcional

- Datas e contagem de dias no fuso `Europe/Athens`, incluindo a diferença de dia em relação à Itália e o horário de verão.
- Próxima atividade confirmada, status concluído, validação de horários e links e aviso de sobreposição.
- Criação, edição, reordenação, exclusão de opcionais e preservação de atividades obrigatórias.
- Orçamento e despesas, cálculos em centavos, distinção entre pago, previsto e realizado, inclusive despesas anteriores à viagem.
- Edição de hotel e informações úteis, checklist, persistência após recarregar.
- Armazenamento de arquivo local, exportação e restauração de backup com imagem, visualização da imagem após recarga offline.
- Navegação offline e manutenção de roteiro, gastos e checklist. Nenhuma requisição HTTP externa durante o fluxo de cadastro e backup testado.
- Rejeição de backups inválidos, versões incompatíveis, identificadores duplicados e arquivos adulterados.
- Restauração atômica: uma falha no meio não altera os dados ou a coleção de documentos anteriores.
- Falha de acesso ao IndexedDB exibe recuperação; falha de escrita por cota mantém o valor anterior e informa o usuário.

## Cronograma incorporado

- 60 blocos (15/14/17/14 por dia), sem compras, reservas ou visitas marcadas como realizadas.
- Fusos locais Itália/Atenas e comparação cronológica entre países; horários intermediários ausentes continuam vazios.
- 11 previsões totalizam €441,81–481,81, com alimentação em faixa e ingressos de €107; hotel e guias não recebem preços inventados.
- Incorporação em instalação anterior preserva notas, orçamento, gastos e arquivo local; a versão impede aplicação duplicada.
- Guias propostos, janela de check-in sobreposta e limite de entrada na escavação continuam sinalizados.
- Faixas de preço, fusos e alternativas sobrevivem à exportação/restauração de backup.

## Limites da validação

A atualização visual em azul/branco foi conferida em 320, 390 e 1440 px, com temas claro/escuro, fotos reais servidas localmente, controles de edição/reordenação preservados e busca local de destinos. O teste offline também confirma que a fotografia principal continua carregada após perder a conexão. Nenhum horário, valor, data, status de compra ou reserva foi alterado pelo redesign.

A instalação pelo menu do Chrome em Android físico, o leitor de PDF do aparelho e a abertura do aplicativo Google Maps dependem do dispositivo final e ainda não foram executados. O GitHub Pages já foi publicado e validado na etapa anterior, com build, testes e deploy pelo GitHub Actions. Alterações enviadas para `main` passam novamente por esse workflow. A emulação do Playwright não equivale a teste físico.

Os arquivos de build, relatórios, capturas e quaisquer backups baixados durante testes ficam fora do Git. O build final em `dist` usa o caminho padrão do repositório.
